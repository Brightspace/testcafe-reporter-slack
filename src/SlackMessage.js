const fs = require("fs");
const util = require('util')
import config from "./config";
import loggingLevels from "./const/LoggingLevels";
import { bold } from "./utils/textFormatters";
import { rejects } from "assert";

export default class SlackMessage {
  constructor() {
    let slackNode = require("slack-node");
    this.slack = new slackNode(config.token);
    this.slack.setWebhook(config.webhookUrl);
    this.loggingLevel = config.loggingLevel;
    this.messages = [];
    this.errorMessages = [];
    this.screenshots = [];
    this.sendMessageInCallback = false;
    this.callbackMessageReady = [];
  }

  addMessage(message) {
    this.messages.push(message);
  }

  addErrorMessage(message) {
    this.errorMessages.push(message);
  }

  sendMessage(message, slackProperties = null) {
    // console.log("Sending this: ", message);
    this.slack.webhook(
      Object.assign(
        {
          channel: config.channel,
          username: config.username,
          ...message,
        },
        slackProperties
      ),
      function (err, response) {
        if (!config.quietMode) {
          if (err) {
            console.log("Unable to send a message to Slack");
            console.log(response);
          } else {
            console.log(
              "The following message has been sent to Slack: \n " +
                JSON.stringify(message, null, "  ")
            );
          }
        }
      }
    );
  }
  // https://api.slack.com/methods/files.upload
  uploadAndShareFile(filePath) {
    return new Promise ((resolve, reject) => {
    const uploadOptions = { "file": fs.createReadStream(filePath) };
    const uploadFilePromise = util.promisify(this.slack.api);
    const shareFilePromise = util.promisify(this.slack.api);
    uploadFilePromise("files.upload", uploadOptions)
    .then((response) => {
      const shareOptions = { "file": response.file.id };
      // Make the uploaded file shareable i.e. accessible from a URL
      // https://api.slack.com/methods/files.sharedPublicURL/
      shareFilePromise("files.sharedPublicURL", shareOptions)
      .then((response) => {
        const { title, permalink, permalink_public, url_private_download } = response.file;
        if (!config.quietMode) console.log("URL:", permalink_public)
        this.screenshots.push({title, permalink, permalink_public, url_private_download});
        resolve(response);
      }).catch(err=>reject("Sharing Public URL had a error: ", err))
    }).catch(err=>reject("Uploading a file had an error: ", err))

    }).catch(err=>console.log(err))
  }

  sendTestReport(nrFailedTests) {
    const report = this.getTestReportMessage();
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

  getTestReportMessage() {
    let message = { text: this.getSlackMessage(), blocks: [] };
    if (this.loggingLevel === loggingLevels.DEBUG) {
      message.blocks = message.blocks.concat(this.getErrorMessageBlocks());
    }
    if (this.loggingLevel !== loggingLevels.SUMMARY) {
      this.sendMessageInCallback = true;
    }
    if (!config.quietMode) console.log("Async message to be sent:", this.sendMessageInCallback)
    if (this.sendMessageInCallback) {
      Promise.all(this.callbackMessageReady).then(response=> {
        if (!config.quietMode) console.log("Sending async message");
        message.blocks = message.blocks.concat(this.getErrorScreenshotsAttachments());
        this.sendMessage(message);
      });
    }
    else return message;
  }

  getErrorMessageBlocks() {
    return this.errorMessages.map((err) => {
      return {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "```" + err + "```",
        },
      };
    });
  }

  getErrorScreenshotsAttachments() {
    const header = [
      {  type: "divider"},
      {
        type: "section",
          text: {
            type: "mrkdwn",
            text: `${bold("Screenshots")}\n`,
          },
      }
    ]
    const screenshots = this.screenshots.map( (screenshot) => {
        return {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${bold(screenshot.title.trimEnd())}\n${screenshot.permalink}`,
          },
        }
        //   type: "image",
				// 	title: {
				// 		type: "plain_text",
				// 		text: screenshot.title,
				// 		emoji: true
				// 	},
				// 	image_url: screenshot.permalink_public, // Slack emits silent error & fails to post message 
				// 	alt_text: screenshot.title
        // };
      })
    return [...header, ...screenshots];
  }

  getSlackMessage() {
    return this.messages.join("\n");
  }
}
