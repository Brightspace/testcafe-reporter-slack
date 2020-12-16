"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _SlackMessage = require("./SlackMessage");

var _SlackMessage2 = _interopRequireDefault(_SlackMessage);

var _constLoggingLevels = require("./const/LoggingLevels");

var _constLoggingLevels2 = _interopRequireDefault(_constLoggingLevels);

var _utilsEmojis = require("./utils/emojis");

var _utilsEmojis2 = _interopRequireDefault(_utilsEmojis);

var _utilsTextFormatters = require("./utils/textFormatters");

var loggingLevel = _config2["default"].loggingLevel;

exports["default"] = function () {
  var lastSiteName = "";

  return {
    noColors: true,

    reportTaskStart: function reportTaskStart(startTime, userAgents, testCount) {
      this.slack = new _SlackMessage2["default"]();
      this.startTime = startTime;
      this.testCount = testCount;

      var startTimeFormatted = this.moment(this.startTime).format("M/D/YYYY h:mm:ss a");
      // sendMessage does not work unless 'text: message' is a prop instead of the '...message' used
      // addMessage will push the reportTaskStart info into the message[] to be sent when test is done?
      this.slack.addMessage(_utilsEmojis2["default"].coffee + " " + "Starting TestCafe:" + " " + (0, _utilsTextFormatters.bold)(startTimeFormatted) + "\nRunning " + (0, _utilsTextFormatters.bold)(testCount) + " tests in: " + (0, _utilsTextFormatters.bold)(userAgents) + "\n");
    },

    reportFixtureStart: function reportFixtureStart(name, path, meta) {
      this.currentFixtureName = name;
      this.currentFixtureMeta = meta;
      var orgUnit = "; OrgUnit: ";
      if (this.currentFixtureMeta.siteName.match(/ou=(\d+)?/)[1]) {
        orgUnit += this.currentFixtureMeta.siteName.match(/ou=(\d+)?/)[1];
      }
      this.slack.addMessage("" + (0, _utilsTextFormatters.bold)(this.currentFixtureName));

      if (lastSiteName !== this.currentFixtureMeta.siteName) {
        this.slack.addMessage("*Site Tested Against:* <" + this.currentFixtureMeta.siteName + "|" + this.currentFixtureMeta.siteName.match(/https?:\/\/(\w+)/)[1] + orgUnit + ">");
      }
      if (lastSiteName === "") lastSiteName = this.currentFixtureMeta.siteName;
    },

    reportTestDone: function reportTestDone(name, testRunInfo) {
      var hasErr = !!testRunInfo.errs.length;
      var message = null;

      if (testRunInfo.skipped) {
        message = _utilsEmojis2["default"].fastForward + " " + (0, _utilsTextFormatters.italics)(name) + " - " + (0, _utilsTextFormatters.bold)("skipped");
      } else if (hasErr) {
        message = _utilsEmojis2["default"].fire + " " + (0, _utilsTextFormatters.italics)(name) + " - " + (0, _utilsTextFormatters.bold)("failed");
        this.renderErrors(testRunInfo.errs);
      } else if (loggingLevel === _constLoggingLevels2["default"].SUMMARY) {
        return; // don't report successful tests to reduce verbosity
      } else {
          message = "" + (0, _utilsTextFormatters.italics)(name);
        }

      this.slack.addMessage(message);
    },

    renderErrors: function renderErrors(errors) {
      var _this = this;

      errors.forEach(function (error, id) {
        _this.slack.addErrorMessage(_this.formatError(error, id + 1 + " "));
      });
    },

    reportTaskDone: function reportTaskDone(endTime, passed, warnings, result) {
      var endTimeFormatted = this.moment(endTime).format("M/D/YYYY h:mm:ss a");
      var durationMs = endTime - this.startTime;
      var durationFormatted = this.moment.duration(durationMs).format("h[h] mm[m] ss[s]");

      var finishedStr = "Testing finished at " + (0, _utilsTextFormatters.bold)(endTimeFormatted) + " ";
      var durationStr = _utilsEmojis2["default"].stopWatch + " Duration: " + (0, _utilsTextFormatters.bold)(durationFormatted) + " ";
      var summaryStr = "";

      if (result && result.skippedCount) summaryStr += _utilsEmojis2["default"].fastForward + " " + (0, _utilsTextFormatters.bold)(result.skippedCount + " skipped") + " ";

      if (result && result.failedCount) {
        summaryStr += _utilsEmojis2["default"].noEntry + " " + (0, _utilsTextFormatters.bold)(result.failedCount + "/" + this.testCount + " failed");
      } else if (result && result.passedCount) {
        summaryStr += _utilsEmojis2["default"].checkMark + " " + (0, _utilsTextFormatters.bold)(result.passedCount + "/" + this.testCount + " passed");
      }

      var message = "\n\n" + finishedStr + " " + durationStr + " " + summaryStr;
      this.slack.addMessage(message);
      this.slack.sendTestReport(this.testCount - passed);
    }
  };
};

module.exports = exports["default"];