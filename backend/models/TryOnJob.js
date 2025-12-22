const mongoose = require("mongoose");

const tryOnJobSchema = new mongoose.Schema(
  {
    queueId: {
      type: String,
      required: true,
      index: true
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    tryonSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TryOnSession",
      index: true
    },

    productImageUrl: {
      type: String,
      required: true
    },

    userB64: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true
    },

    result: Object,
    error: String,

    lockedAt: Date,
    retryCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("TryOnJob", tryOnJobSchema);