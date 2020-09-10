"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _constLoggingLevels = require("./const/LoggingLevels");

var _constLoggingLevels2 = _interopRequireDefault(_constLoggingLevels);

var _utilsTextFormatters = require("./utils/textFormatters");

var _assert = require("assert");

var fs = require("fs");
var util = require('util');

var SlackMessage = (function () {
  function SlackMessage() {
    _classCallCheck(this, SlackMessage);

    var slackNode = require("slack-node");
    this.slack = new slackNode(_config2["default"].token);
    this.slack.setWebhook(_config2["default"].webhookUrl);
    this.loggingLevel = _config2["default"].loggingLevel;
    this.messages = [];
    this.errorMessages = [];
    this.screenshots = [];
    this.sendMessageInCallback = false;
    this.callbackMessageReady = [];
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
            console.log("The following message has been sent to Slack: \n " + JSON.stringify(message, null, "  "));
          }
        }
      });
    }

    // https://api.slack.com/methods/files.upload
  }, {
    key: "uploadAndShareFile",
    value: function uploadAndShareFile(filePath) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var uploadOptions = { "file": fs.createReadStream(filePath) };
        var uploadFilePromise = util.promisify(_this.slack.api);
        var shareFilePromise = util.promisify(_this.slack.api);
        uploadFilePromise("files.upload", uploadOptions).then(function (response) {
          var shareOptions = { "file": response.file.id };
          // Make the uploaded file shareable i.e. accessible from a URL
          // https://api.slack.com/methods/files.sharedPublicURL/
          shareFilePromise("files.sharedPublicURL", shareOptions).then(function (response) {
            var _response$file = response.file;
            var title = _response$file.title;
            var permalink = _response$file.permalink;
            var permalink_public = _response$file.permalink_public;
            var url_private_download = _response$file.url_private_download;

            if (!_config2["default"].quietMode) console.log("URL:", permalink_public);
            _this.screenshots.push({ title: title, permalink: permalink, permalink_public: permalink_public, url_private_download: url_private_download });
            resolve(response);
          })["catch"](function (err) {
            return reject("Sharing Public URL had a error: ", err);
          });
        })["catch"](function (err) {
          return reject("Uploading a file had an error: ", err);
        });
      })["catch"](function (err) {
        return console.log(err);
      });
    }
  }, {
    key: "sendTestReport",
    value: function sendTestReport(nrFailedTests) {
      var report = this.getTestReportMessage();
      if (report) this.sendMessage(report);
      // Sends a summary message of tests failed as a Slack `attachments` object, works in v0.2.0 but is here for ref only
      // nrFailedTests > 0 && this.loggingLevel === loggingLevels.DEBUG
      //   ? {
      //       attachments: [
      //         {
      //           color: "danger",
      //           text: `${nrFailedTests} test(s) failed`,
      //         },
      //       ],
      //     }
      //   : null
    }
  }, {
    key: "getTestReportMessage",
    value: function getTestReportMessage() {
      var _this2 = this;

      var message = { text: this.getSlackMessage(), blocks: [] };
      if (this.loggingLevel === _constLoggingLevels2["default"].DEBUG) {
        message.blocks = message.blocks.concat(this.getErrorMessageBlocks());
      }
      if (this.loggingLevel !== _constLoggingLevels2["default"].SUMMARY) {
        this.sendMessageInCallback = true;
      }
      if (!_config2["default"].quietMode) console.log("Async message to be sent:", this.sendMessageInCallback);
      if (this.sendMessageInCallback) {
        Promise.all(this.callbackMessageReady).then(function (response) {
          if (!_config2["default"].quietMode) console.log(_this2.callbackMessageReady.length);
          if (!_config2["default"].quietMode) console.log("Sending async message");
          if (!_config2["default"].quietMode) console.log("===>", _this2.screenshots);
          message.blocks = message.blocks.concat(_this2.getErrorScreenshotsAttachments());
          _this2.sendMessage(message);
        });
      } else return message;
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
    key: "getErrorScreenshotsAttachments",
    value: function getErrorScreenshotsAttachments() {
      var header = [{ type: "divider" }, {
        type: "section",
        text: {
          type: "mrkdwn",
          text: (0, _utilsTextFormatters.bold)("Screenshots") + "\n"
        }
      }];
      var screenshots = this.screenshots.map(function (screenshot) {
        return {
          type: "section",
          text: {
            type: "mrkdwn",
            text: (0, _utilsTextFormatters.bold)(screenshot.title.trimEnd()) + "\n" + screenshot.permalink
          }
        };
        //   type: "image",
        // 	title: {
        // 		type: "plain_text",
        // 		text: screenshot.title,
        // 		emoji: true
        // 	},
        // 	image_url: screenshot.permalink_public, // Slack emits silent error & fails to post message
        // 	alt_text: screenshot.title
        // };
      });
      return [].concat(header, _toConsumableArray(screenshots));
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