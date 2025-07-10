const Queue = require("bee-queue");
const { REDIS_URL } = require("./config");
const { FailedJob } = require("./models");

module.exports = class BaseJob {
  #queueInstance;
  #jobName = "";
  #jobError;
  #jobInputs;
  /**
   * @type {(job: import('bee-queue').Job<any>) => Promise<any>}
   */
  #job;

  constructor(jobName = "default") {
    if (new.target === BaseJob) {
      throw new TypeError("Cannot instantiate an interface directly.");
    }

    this.#jobName = jobName;
    this.#queueInstance = new Queue(jobName, {
      redis: {
        url: REDIS_URL,
      },
    });
  }

  /**
   *
   * @param {object} inputs
   * @param {number} retries
   */
  async queue(inputs = {}, retries = 5) {
    if (!this.#queueInstance || !(this.#queueInstance instanceof Queue)) {
      throw new Error("Queue is undefined or not an instance of Queue.");
    }

    if (!this.#job) {
      throw new Error(
        "Job is undefined. Please specify using this.createJob() in class constructor"
      );
    }

    this.#jobInputs = inputs;

    const job = await this.#queueInstance
      .createJob(inputs)
      .retries(retries)
      .save();

    job.on("failed", async (error) => {
      this.#jobError = error;
      await this.handleError();
    });

    job.on("succeeded", this.handleSuccess);
  }

  /**
   * Set the job handler function.
   * @param {(job: import('bee-queue').Job<any>) => Promise<any>} job
   */
  createJob(job) {
    this.#job = job;

    return this;
  }

  async process() {
    if (!this.#queueInstance || !(this.#queueInstance instanceof Queue)) {
      throw new Error("Queue is undefined or not an instance of Queue.");
    }

    if (!this.#job) {
      throw new Error(
        "Job is undefined. Please specify using this.createJob() in class constructor"
      );
    }

    return this.#queueInstance.process(5, this.#job);
  }

  /**
   *
   * @param {object} inputs
   * @param {any} error
   */
  async handleError() {
    await FailedJob.insertOne({
      name: this.#jobName,
      error: this.#jobError,
      inputs: this.#jobInputs,
    });
  }

  async handleSuccess(result) {}

  getJobError() {
    return this.#jobError;
  }

  getJobName() {
    return this.#jobName;
  }

  getJobInputs() {
    return this.#jobInputs;
  }

  getQueue() {
    return this.#queueInstance;
  }
};
