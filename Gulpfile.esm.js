import gulp from "gulp";
import babel from"gulp-babel";
import mocha from "gulp-mocha";
import del from "del";

gulp.task("clean", done => {
  del("lib", done => done());
  done();
});

gulp.task(
  "build",
  gulp.series("clean", function() {
    return gulp
      .src("src/**/*.js")
      .pipe(babel({
        presets: ['@babel/preset-env'],
        plugins: ['dynamic-import-node'],
        }))
      .pipe(gulp.dest("lib"));
  })
);

gulp.task(
  "watch",
  gulp.parallel("build", function() {
    gulp.watch("src/*.js", ["build"]);
  })
);

gulp.task(
  "mocha",
  function() {
    return gulp.src("test/**.js").pipe(
      mocha({
        ui: "bdd",
        reporter: "spec",
        timeout: typeof v8debug === "undefined" ? 2000 : Infinity // NOTE: disable timeouts in debug
      })
    );
  }
)

gulp.task(
  "test",
  gulp.series("build", "mocha")
);

gulp.task(
  "preview",
  gulp.series("build", function() {
    const buildReporterPlugin = require("testcafe").embeddingUtils
      .buildReporterPlugin;
    const pluginFactory = require("./lib");
    const reporterTestCalls = require("./test/utils/reporter-test-calls");
    const plugin = buildReporterPlugin(pluginFactory);

    reporterTestCalls.forEach(function(call) {
      plugin[call.method].apply(plugin, call.args);
    });

    process.exit(0);
  })
);