const { Schema, default: mongoose } = require("mongoose");

const failedJobSchema = new Schema(
  {
    name: String,
    error: mongoose.Schema.Types.Mixed,
    inputs: Object,
  },
  { timestamps: true }
);

const FailedJob = mongoose.model("FailedJob", failedJobSchema);

module.exports = { FailedJob };
