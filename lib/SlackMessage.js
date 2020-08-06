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
    key: "convertTextToBlock",
    value: function convertTextToBlock(text) {
      return {
        blocks: [{
          type: "section",
          text: {
            type: "mrkdwn",
            text: text
          }
        }]
      };
    }

    // sendMessage(message, slackProperties = null) {
    //   let formattedMessage =
    //     typeof message === "string" ? this.convertTextToBlock(message) : message;
    // this.slack
    //     .send(
    //       Object.assign(
    //         {
    //           channel: config.channel,
    //           username: config.username,
    //           ...formattedMessage
    //         },
    //         slackProperties
    //       )
    //     )
    //     .then(response => {
    //       if (!config.quietMode) {
    //         console.log(
    //           `The following message is send to slack: \n ${JSON.stringify(
    //             formattedMessage,
    //             undefined,
    //             2
    //           )}`
    //         );
    //       }
    //     })
    //     .catch(err => {
    //       console.log("Unable to send a message to slack");
    //       console.log(err);
    //     });

  }, {
    key: "sendMessage",
    value: function sendMessage(message) {
      var slackProperties = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      console.log("Sending this: ", message);
      this.slack.webhook(Object.assign(_extends({
        channel: _config2["default"].channel,
        username: _config2["default"].username
      }, message, {
        blocks: message.blocks
      }), slackProperties), function (err, response) {
        if (!_config2["default"].quietMode) {
          if (err) {
            console.log("Unable to send a message to Slack");
            console.log(response);
          } else {
            console.log("The following message has been sent to Slack: \n " + message);
          }
        }
      });
    }
  }, {
    key: "sendTestReport",
    value: function sendTestReport(nrFailedTests) {
      this.sendMessage(this.getTestReportMessage(), nrFailedTests > 0 && this.loggingLevel === _constLoggingLevels2["default"].TEST ? {
        attachments: [{
          color: "danger",
          text: nrFailedTests + " test(s) failed"
        }]
      } : null);
    }
  }, {
    key: "getTestReportMessage",
    value: function getTestReportMessage() {
      var message = { text: this.getSlackMessage(), blocks: [] };
      // let message = {
      //   blocks: [
      //     {
      //       type: "section",
      //       text: {
      //         type: "mrkdwn",
      //         text: this.getSlackMessage()
      //       }
      //     }
      //   ]
      // };
      if (this.loggingLevel === _constLoggingLevels2["default"].TEST) {
        message.blocks = message.blocks.concat(this.getErrorMessageBlocks());
        message.text = message.text + this.getErrorMessageBlocks().join("\n");
      }
      // message.blocks.map((blk) => console.log(blk));
      console.log(message.blocks);
      // message.blocks = [
      //   {
      //     type: "section",
      //     text: {
      //       type: "mrkdwn",
      //       text: "Danny Torrence left the following review for your property:",
      //     },
      //   },
      //   {
      //     type: "section",
      //     block_id: "section567",
      //     text: {
      //       type: "mrkdwn",
      //       text:
      //         "<https://example.com|Overlook Hotel> \n :star: \n Doors had too many axe holes, guest in room 237 was far too rowdy, whole place felt stuck in the 1920s.",
      //     },
      //     accessory: {
      //       type: "image",
      //       image_url:
      //         "https://is5-ssl.mzstatic.com/image/thumb/Purple3/v4/d3/72/5c/d3725c8f-c642-5d69-1904-aa36e4297885/source/256x256bb.jpg",
      //       alt_text: "Haunted hotel image",
      //     },
      //   },
      //   {
      //     type: "section",
      //     block_id: "section789",
      //     fields: [
      //       {
      //         type: "mrkdwn",
      //         text: "*Average Rating*\n1.0",
      //       },
      //     ],
      //   },
      // ];
      return message;
    }
  }, {
    key: "getErrorMessageBlocks",
    value: function getErrorMessageBlocks() {
      // this.errorMessages.map((err) =>
      //   this.addMessage({
      //     type: "section",
      //     text: {
      //       type: "mrkdwn",
      //       text: "\n\n\n```" + err + "```",
      //     },
      //   })
      // );
      return this.errorMessages.map(function (err) {
        // console.log(err);
        return JSON.stringify({
          type: "section",
          text: {
            type: "mrkdwn",
            text: "\n\n\n```" + err + "```"
          }
        });
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