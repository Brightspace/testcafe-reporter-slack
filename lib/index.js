"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _config = _interopRequireDefault(require("./config"));

var _SlackMessage = _interopRequireDefault(require("./SlackMessage"));

var _LoggingLevels = _interopRequireDefault(require("./const/LoggingLevels"));

var _emojis = _interopRequireDefault(require("./utils/emojis"));

var _textFormatters = require("./utils/textFormatters");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var loggingLevel = _config["default"].loggingLevel;

function _default() {
  return {
    noColors: true,
    reportTaskStart: function reportTaskStart(startTime, userAgents, testCount) {
      this.slack = new _SlackMessage["default"]();
      this.startTime = startTime;
      this.testCount = testCount;
      var startTimeFormatted = this.moment(this.startTime).format("M/D/YYYY h:mm:ss a"); // sendMessage does not work unless 'text: message' is a prop instead of the '...message' used
      // addMessage will push the reportTaskStart info into the message[] to be sent when test is done?

      this.slack.addMessage("".concat(_emojis["default"].coffee, " ", "Starting TestCafe:", " ").concat((0, _textFormatters.bold)(startTimeFormatted), "\n").concat(_emojis["default"].computer, " Running ").concat((0, _textFormatters.bold)(testCount), " tests in: ").concat((0, _textFormatters.bold)(userAgents), "\n"));
    },
    reportFixtureStart: function reportFixtureStart(name, path, meta) {
      this.currentFixtureName = name;
      this.currentFixtureMeta = meta;
      this.slack.addMessage("*Site Tested Against:* <" + this.currentFixtureMeta.siteName + "|" + this.currentFixtureMeta.siteName.match(/https:\/\/(\w+)/)[1] + ">");
      this.slack.addMessage("".concat((0, _textFormatters.bold)(this.currentFixtureName))); // if (loggingLevel === LoggingLevels.TEST)
    },
    reportTestDone: function reportTestDone(name, testRunInfo) {
      var hasErr = !!testRunInfo.errs.length;
      var message = null;

      if (testRunInfo.skipped) {
        message = "".concat(_emojis["default"].fastForward, " ").concat((0, _textFormatters.italics)(name), " - ").concat((0, _textFormatters.bold)("skipped"));
      } else if (hasErr) {
        message = "".concat(_emojis["default"].fire, " ").concat((0, _textFormatters.italics)(name), " - ").concat((0, _textFormatters.bold)("failed"));
        this.renderErrors(testRunInfo.errs);
      } else {
        message = "".concat(_emojis["default"].checkMark, " ").concat((0, _textFormatters.italics)(name));
      }

      if (loggingLevel === _LoggingLevels["default"].TEST || _LoggingLevels["default"].DEBUG) this.slack.addMessage(message);
    },
    renderErrors: function renderErrors(errors) {
      var _this = this;

      errors.forEach(function (error, id) {
        _this.slack.addErrorMessage(_this.formatError(error, "".concat(id + 1, " ")));
      });
    },
    reportTaskDone: function reportTaskDone(endTime, passed, warnings, result) {
      var endTimeFormatted = this.moment(endTime).format("M/D/YYYY h:mm:ss a");
      var durationMs = endTime - this.startTime;
      var durationFormatted = this.moment.duration(durationMs).format("h[h] mm[m] ss[s]");
      var finishedStr = "".concat(_emojis["default"].finishFlag, " Testing finished at ").concat((0, _textFormatters.bold)(endTimeFormatted), " ");
      var durationStr = "".concat(_emojis["default"].stopWatch, " Duration: ").concat((0, _textFormatters.bold)(durationFormatted), " ");
      var summaryStr = "";
      if (result && result.skippedCount) summaryStr += "".concat(_emojis["default"].fastForward, " ").concat((0, _textFormatters.bold)("".concat(result.skippedCount, " skipped")), " ");

      if (result && result.failedCount) {
        summaryStr += "".concat(_emojis["default"].noEntry, " ").concat((0, _textFormatters.bold)("".concat(result.failedCount, "/").concat(this.testCount, " failed")));
      } else if (result && result.passedCount) {
        summaryStr += "".concat(_emojis["default"].checkMark, " ").concat((0, _textFormatters.bold)("".concat(result.passedCount, "/").concat(this.testCount, " passed")));
      }

      var message = "\n\n".concat(finishedStr, " ").concat(durationStr, " ").concat(summaryStr);
      this.slack.addMessage(message);
      this.slack.sendTestReport(this.testCount - passed);
    }
  };
}