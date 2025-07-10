const SimpleJob = require("./simple-job");

const job = new SimpleJob();

job.handleSuccess = async () => {
  console.log("Done");
  await job.getQueue().close();
};

(async () => {
  await job.process();
  await job.queue();

  const shutdown = async () => {
    console.log("Shutting down gracefully...");
    await job.getQueue().close();
    console.log("Queue closed.");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})();
