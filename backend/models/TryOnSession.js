const mongoose = require("mongoose");

const tryOnSessionSchema = new mongoose.Schema(
  {
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
    
    queueId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    
    active: {
      type: Boolean,
      default: true,
      index: true
    },
    
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      index: true
    }
  },
  { timestamps: true }
);

// Auto-delete expired sessions
tryOnSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("TryOnSession", tryOnSessionSchema);