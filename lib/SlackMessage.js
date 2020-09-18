"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _constLoggingLevels = require("./const/LoggingLevels");

var _constLoggingLevels2 = _interopRequireDefault(_constLoggingLevels);

var SlackMessage = (function () {
  function SlackMessage() {
    _classCallCheck(this, SlackMessage);

    var slackNode = require("slack-node");
    this.slack = new slackNode();
    this.slack.setWebhook(_config2["default"].webhookUrl);
    this.loggingLevel = _config2["default"].loggingLevel;
    this.messages = [];
    this.errorMessages = [];
  }

  _createClass(SlackMessage, [{
    key: "addMessage",
    value: function addMessage(message) {
      this.messages.push(message);
    }
  }, {
    key: "addErrorMessage",
    value: function addErrorMessage(message) {
      this.errorMessages.push(message);
    }
  }, {
    key: "sendMessage",
    value: function sendMessage(message) {
      var slackProperties = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      // console.log("Sending this: ", message);
      this.slack.webhook(Object.assign(_extends({
        channel: _config2["default"].channel,
        username: _config2["default"].username
      }, message), slackProperties), function (err, response) {
        if (!_config2["default"].quietMode) {
          if (err) {
            console.log("Unable to send a message to Slack");
            console.log(response);
          } else {
            console.log(response);
            console.log("The following message has been sent to Slack: \n" + JSON.stringify(message, null, "  "));
          }
        }
      });
    }
  }, {
    key: "sendTestReport",
    value: function sendTestReport(nrFailedTests) {
      // Sends a summary message of tests failed as a Slack `attachments` object, works but is here for ref only

      this.sendMessage(this.getTestReportMessage()
      // ,nrFailedTests > 0 && this.loggingLevel === loggingLevels.DEBUG
      //   ? {
      //       attachments: [
      //         {
      //           color: "danger",
      //           text: `${nrFailedTests} test(s) failed`,
      //         },
      //       ],
      //     }
      //   : null
      );
    }
  }, {
    key: "getTestReportMessage",
    value: function getTestReportMessage() {
      var message = { text: this.getSlackMessage(), blocks: [] };
      if (this.loggingLevel === _constLoggingLevels2["default"].DEBUG) {
        message.blocks = message.blocks.concat(this.getErrorMessageBlocks());
      }
      return message;
    }
  }, {
    key: "getErrorMessageBlocks",
    value: function getErrorMessageBlocks() {
      return this.errorMessages.map(function (err) {
        return {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "```" + err + "```"
          }
        };
      });
    }
  }, {
    key: "getSlackMessage",
    value: function getSlackMessage() {
      return this.messages.join("\n");
    }
  }]);

  return SlackMessage;
})();

exports["default"] = SlackMessage;
module.exports = exports["default"];