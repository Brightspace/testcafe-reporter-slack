import loggingLevels from "./const/LoggingLevels";

require('dotenv').config();
const envs = require('envs');

const quietMode = envs('TESTCAFE_SLACK_QUIET_MODE', false);

export default class SlackMessage {
    constructor(loggingLevel) {
        let slackNode = require('slack-node');
        this.slack = new slackNode();
        this.slack.setWebhook(envs('TESTCAFE_SLACK_WEBHOOK', 'http://example.com'));
        this.loggingLevel = loggingLevel;
        this.message = [];
        this.errorMessage = [];
    }

    getMessage() {
      return this.message
    }

    addMessage(message) {
        this.message.push(message)
    }

    addErrorMessage(message) {
        this.errorMessage.push(message)
    }

    sendMessage(message, slackProperties = null) {
        this.slack.webhook(Object.assign({
            channel: envs('TESTCAFE_SLACK_CHANNEL', '#testcafe'),
            username: envs('TESTCAFE_SLACK_BOT', 'testcafebot'),
            text: message
        }, slackProperties), function (err, response) {
            if (!quietMode) {
              if(err) {
                console.log('Unable to send a message to slack');
                console.log(response);
              } else {
                console.log(`The following message is send to slack: \n ${message}`);
              }
            }
        })
    }

    sendTestReport(nrFailedTests) {
        this.sendMessage(this.getTestReportMessage(), nrFailedTests > 0 && this.loggingLevel === loggingLevels.TEST
            ? {
                "attachments": [{
                    color: 'danger',
                    text: `${nrFailedTests} test failed`
                }]
            }
            : null
        )
    }

    getTestReportMessage() {
        let message = this.getSlackMessage();
        let errorMessage = this.getErrorMessage();

        if (this.loggingLevel === loggingLevels.TEST && errorMessage.length > 0) {
            message = message + "\n\n\n```" + this.getErrorMessage() + '```';
        }
        return message;
    }

    getErrorMessage() {
        return this.errorMessage.join("\n\n\n");
    }

    getSlackMessage() {
        return this.message.join("\n");
    }
}
