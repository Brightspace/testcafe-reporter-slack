const TestRunErrorFormattableAdapter = require("testcafe").embeddingUtils
  .TestRunErrorFormattableAdapter;
const UncaughtErrorOnPage = require("testcafe").embeddingUtils.testRunErrors
  .UncaughtErrorOnPage;
const ActionElementNotFoundError = require("testcafe").embeddingUtils
  .testRunErrors.ActionElementNotFoundError;
const testCallsite = require("./test-callsite");

function makeErrors(errDescrs) {
  return errDescrs.map(function (descr) {
    return new TestRunErrorFormattableAdapter(descr.err, descr.metaInfo);
  });
}
const imgPath = "C:/D2L/face-ui-test/screenshots/2020-08-13/Firefox_79.0_Windows_10/FACE Instructor assignment edit (Modular & Final After Save Check)/00-52-39_EditAssignmentTypeSubmissionCompletion_.png"
module.exports = [
  {
    method: "reportTaskStart",
    args: [
      new Date("1970-01-01T00:00:00.000Z"),
      ["Chrome 41.0.2227 / Mac OS X 10.10.1", "Firefox 47 / Mac OS X 10.10.1"],
      6,
    ],
  },
  {
    method: "reportFixtureStart",
    args: [
      "First fixture",
      "./fixture1.js",
      {
        siteName:
          "https://cd2020924185.devlms.brightspace.com/d2l/lms/dropbox/admin/folders_manage.d2l?ou=123171",
      },
    ],
  },
  {
    method: "reportTestDone",
    args: [
      "First test in first fixture",
      {
        errs: [],
        durationMs: 74000,
        unstable: true,
        screenshotPath: imgPath,
        screenshots: [{screenshotPath: imgPath}, {screenshotPath: imgPath}]
      },
    ],
  },
  {
    method: "reportTestDone",
    args: [
      "Second test in first fixture",
      {
        // errs: [],
        errs: makeErrors([
          {
            err: new UncaughtErrorOnPage("Some error", "http://example.org"),

            metaInfo: {
              userAgent: "Chrome 41.0.2227 / Mac OS X 10.10.1",
              screenshotPath: "/screenshots/1445437598847/errors",
              callsite: testCallsite,
              testRunState: "inTest",
            },
          },
          {
            err: new ActionElementNotFoundError({
              apiFnChain: ["one", "two", "three"],
              apiFnIndex: 1,
            }),

            metaInfo: {
              userAgent: "Firefox 47 / Mac OS X 10.10.1",
              callsite: testCallsite,
              testRunState: "inTest",
            },
          },
        ]),

        durationMs: 74000,
        unstable: false,
        screenshotPath: null,
      },
    ],
  },
  {
    method: "reportTestDone",
    args: [
      "Third test in first fixture",
      {
        errs: [],
        durationMs: 74000,
        unstable: false,
        screenshotPath: null,
      },
    ],
  },
  {
    method: "reportFixtureStart",
    args: [
      "Second fixture",
      "./fixture2.js",
      {
        siteName:
          "https://cd2020924185.devlms.brightspace.com/d2l/lms/dropbox/admin/folders_manage.d2l?ou=123171",
      },
    ],
  },
  {
    method: "reportTestDone",
    args: [
      "First test in second fixture",
      {
        errs: [],
        durationMs: 74000,
        unstable: false,
        screenshotPath: null
      },
    ],
  },
  {
    method: "reportTestDone",
    args: [
      "Second test in second fixture",
      {
        errs: [],
        durationMs: 74000,
        unstable: false,
        screenshotPath: null,
      },
    ],
  },
  {
    method: "reportTestDone",
    args: [
      "Third test in second fixture",
      {
        errs: [],
        durationMs: 0,
        unstable: false,
        screenshotPath: null,
        skipped: false,
      },
    ],
  },
  {
    method: "reportFixtureStart",
    args: [
      "Third fixture",
      "./fixture3.js",
      {
        siteName:
          "https://cd2020924185.devlms.brightspace.com/d2l/lms/dropbox/admin/folders_manage.d2l?ou=123171",
      },
    ],
  },
  {
    method: "reportTestDone",
    args: [
      "First test in third fixture",
      {
        // errs: [],
        errs: makeErrors([
          {
            err: new ActionElementNotFoundError({
              apiFnChain: ["one", "two", "three"],
              apiFnIndex: 1,
            }),

            metaInfo: {
              userAgent: "Firefox 47 / Mac OS X 10.10.1",
              callsite: testCallsite,
              testRunState: "inBeforeEach",
            },
          },
        ]),

        durationMs: 74000,
        unstable: true,
        screenshotPath: null,
      },
    ],
  },
  {
    method: "reportTaskDone",
    args: [
      new Date("1970-01-01T00:15:25.000Z"),
      6,
      [
        "Was unable to take a screenshot due to an error.\n\nReferenceError: someVar is not defined",
        "Was unable to take a screenshot due to an error.\n\nReferenceError: someOtherVar is not defined",
        "Was unable to take screenshots because the screenshot directory is not specified. " +
          'To specify it, use the "-s" or "--screenshots" command line option or the ' +
          '"screenshots" method of the test runner in case you are using API.',
      ],
    ],
  },
];
