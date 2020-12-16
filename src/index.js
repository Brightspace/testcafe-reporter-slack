import config from "./config";
import SlackMessage from "./SlackMessage";
import LoggingLevels from "./const/LoggingLevels";
import emojis from "./utils/emojis";
import { bold, italics } from "./utils/textFormatters";

const { loggingLevel } = config;

export default function() {
  let lastSiteName = "";

  return {
    noColors: true,

    reportTaskStart(startTime, userAgents, testCount) {
      this.slack = new SlackMessage();
      this.startTime = startTime;
      this.testCount = testCount;

      const startTimeFormatted = this.moment(this.startTime).format(
        "M/D/YYYY h:mm:ss a"
      );
      // sendMessage does not work unless 'text: message' is a prop instead of the '...message' used
      // addMessage will push the reportTaskStart info into the message[] to be sent when test is done?
      this.slack.addMessage(
        `${emojis.coffee} ${"Starting TestCafe:"} ${bold(
          startTimeFormatted
        )}\nRunning ${bold(testCount)} tests in: ${bold(
          userAgents
        )}\n`
      );
    },

    reportFixtureStart(name, path, meta) {
      this.currentFixtureName = name;
      this.currentFixtureMeta = meta;
      let orgUnit = "; OrgUnit: ";
      if (this.currentFixtureMeta.siteName.match(/ou=(\d+)?/)[1]) {
        orgUnit += this.currentFixtureMeta.siteName.match(/ou=(\d+)?/)[1];
      }
      this.slack.addMessage(`${bold(this.currentFixtureName)}`);

      if (lastSiteName !== this.currentFixtureMeta.siteName) {
        this.slack.addMessage(
          "*Site Tested Against:* <" +
          this.currentFixtureMeta.siteName +
          "|" +
          this.currentFixtureMeta.siteName.match(/https?:\/\/(\w+)/)[1] +
          orgUnit +
          ">"
        );
      }
      if (lastSiteName === "") lastSiteName = this.currentFixtureMeta.siteName;

    },

    reportTestDone(name, testRunInfo) {
      const hasErr = !!testRunInfo.errs.length;
      let message = null;

      if (testRunInfo.skipped) {
        message = `${emojis.fastForward} ${italics(name)} - ${bold("skipped")}`;
      } else if (hasErr) {
        message = `${emojis.fire} ${italics(name)} - ${bold("failed")}`;
        this.renderErrors(testRunInfo.errs);
      } else if (loggingLevel === LoggingLevels.SUMMARY) {
        return; // don't report successful tests to reduce verbosity
      } else {
        message = `${italics(name)}`;
      }

      this.slack.addMessage(message);
    },

    renderErrors(errors) {
      errors.forEach((error, id) => {
        this.slack.addErrorMessage(this.formatError(error, `${id + 1} `));
      });
    },

    reportTaskDone(endTime, passed, warnings, result) {
      const endTimeFormatted = this.moment(endTime).format(
        "M/D/YYYY h:mm:ss a"
      );
      const durationMs = endTime - this.startTime;
      const durationFormatted = this.moment
        .duration(durationMs)
        .format("h[h] mm[m] ss[s]");

      const finishedStr = `Testing finished at ${bold(
        endTimeFormatted
      )} `;
      const durationStr = `${emojis.stopWatch} Duration: ${bold(
        durationFormatted
      )} `;
      let summaryStr = "";

      if (result && result.skippedCount)
        summaryStr += `${emojis.fastForward} ${bold(
          `${result.skippedCount} skipped`
        )} `;

      if (result && result.failedCount) {
        summaryStr += `${emojis.noEntry} ${bold(
          `${result.failedCount}/${this.testCount} failed`
        )}`;
      } else if (result && result.passedCount) {
        summaryStr += `${emojis.checkMark} ${bold(
          `${result.passedCount}/${this.testCount} passed`
        )}`;
      }

      const message = `\n\n${finishedStr} ${durationStr} ${summaryStr}`;
      this.slack.addMessage(message);
      this.slack.sendTestReport(this.testCount - passed);
    },
  };
}
