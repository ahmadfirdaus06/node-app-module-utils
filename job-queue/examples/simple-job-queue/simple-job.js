const BaseJob = require("../..");

class SimpleJob extends BaseJob {
  constructor() {
    super("simple-job");

    this.createJob(async () => {
      console.log("Start processing...");
    });
  }
}

module.exports = SimpleJob;
