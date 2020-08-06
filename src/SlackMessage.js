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

  // From another forked repo: https://github.com/confluentinc/testcafe-reporter-slack/blob/master/src/SlackMessage.js
  // May be useful to get formatting to work
  // convertTextToBlock(text) {
  //   return {
  //     blocks: [
  //       {
  //         type: "section",
  //         text: {
  //           type: "mrkdwn",
  //           text,
  //         },
  //       },
  //     ],
  //   };
  // }
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

  sendMessage(message, slackProperties = null) {
    console.log("Sending this: ", message);
    this.slack.webhook(
      Object.assign(
        {
          channel: config.channel,
          username: config.username,
          ...message,
          blocks: message.blocks,
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
              "The following message has been sent to Slack: \n " + message
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
    if (this.loggingLevel === loggingLevels.TEST) {
      message.blocks = message.blocks.concat(this.getErrorMessageBlocks());
      message.text = message.text + this.getErrorMessageBlocks().join("\n");
    }
    // message.blocks.map((blk) => console.log(blk)); debugging
    console.log(message.blocks);
    // Debug test to see if slack will render `blocks`
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

  getErrorMessageBlocks() {
    // Debug, appends errors to `text` object sent to slack but formatting is lost
    // this.errorMessages.map((err) =>
    //   this.addMessage({
    //     type: "section",
    //     text: {
    //       type: "mrkdwn",
    //       text: "\n\n\n```" + err + "```",
    //     },
    //   })
    // );
    return this.errorMessages.map((err) => {
      // console.log(err); Debug to see errors exist
      return JSON.stringify({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "\n\n\n```" + err + "```",
        },
      });
    });
  }

  getSlackMessage() {
    return this.messages.join("\n");
  }
}
