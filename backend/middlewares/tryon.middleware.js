const mongoose = require("mongoose");
const TryOnSession = require("../models/TryOnSession");
const { v4: uuidv4 } = require("uuid");

module.exports = async function attachTryOnSession(req, res, next) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      req.tryOnSession = null;
      return next();
    }

    let session = await TryOnSession.findOne({
      userId,
      active: true,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!session) {
      await TryOnSession.updateMany(
        { userId, active: true },
        { active: false }
      );

      session = await TryOnSession.create({
        sessionId: new mongoose.Types.ObjectId(),
        userId,
        queueId: `queue_${uuidv4()}`,
        active: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    }

    req.tryOnSession = session;
    next();
  } catch (err) {
    console.error("TryOn session middleware error:", err);
    req.tryOnSession = null;
    next();
  }
};
