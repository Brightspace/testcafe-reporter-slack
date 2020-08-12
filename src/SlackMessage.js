import config from "./config";
import loggingLevels from "./const/LoggingLevels";

export default class SlackMessage {
  constructor() {
    let slackNode = require("slack-node");
    this.slack = new slackNode();
    this.slack.setWebhook(config.webhookUrl);
    this.loggingLevel = config.loggingLevel;
    this.messages = [];
    this.errorMessages = [];
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

  sendTestReport(nrFailedTests) {
    // Sends a summary message of tests failed as a Slack `attachments` object, works but is here for ref only
    this.sendMessage(
      this.getTestReportMessage(),
      nrFailedTests > 0 && this.loggingLevel === loggingLevels.TEST
        ? {
            attachments: [
              {
                color: "danger",
                text: `${nrFailedTests} test(s) failed`,
              },
            ],
          }
        : null
    );
  }

  getTestReportMessage() {
    let message = { text: this.getSlackMessage(), blocks: [] };
    if (this.loggingLevel === loggingLevels.DEBUG) {
      message.blocks = message.blocks.concat(this.getErrorMessageBlocks());
    }
    return message;
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

  getSlackMessage() {
    return this.messages.join("\n");
  }
}
