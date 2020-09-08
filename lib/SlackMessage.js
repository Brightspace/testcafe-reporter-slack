"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _config = _interopRequireDefault(require("./config"));

var _LoggingLevels = _interopRequireDefault(require("./const/LoggingLevels"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SlackMessage = /*#__PURE__*/function () {
  function SlackMessage() {
    _classCallCheck(this, SlackMessage);

    var slackNode = require("slack-node");

    this.slack = new slackNode();
    this.slack.setWebhook(_config["default"].webhookUrl);
    this.loggingLevel = _config["default"].loggingLevel;
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
      var slackProperties = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      // console.log("Sending this: ", message);
      this.slack.webhook(Object.assign(_objectSpread({
        channel: _config["default"].channel,
        username: _config["default"].username
      }, message), slackProperties), function (err, response) {
        if (!_config["default"].quietMode) {
          if (err) {
            console.log("Unable to send a message to Slack");
            console.log(response);
          } else {
            console.log("The following message has been sent to Slack: \n " + JSON.stringify(message, null, "  "));
          }
        }
      });
    }
  }, {
    key: "sendTestReport",
    value: function sendTestReport(nrFailedTests) {
      // Sends a summary message of tests failed as a Slack `attachments` object, works but is here for ref only
      this.sendMessage(this.getTestReportMessage() // nrFailedTests > 0 && this.loggingLevel === loggingLevels.DEBUG
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
      var message = {
        text: this.getSlackMessage(),
        blocks: []
      };

      if (this.loggingLevel === _LoggingLevels["default"].DEBUG) {
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
}();

exports["default"] = SlackMessage;