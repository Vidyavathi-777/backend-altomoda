const mongoose = require("mongoose");
const TryOnSession = require("../models/TryOnSession");
const { v4: uuidv4 } = require("uuid");

module.exports = async function attachTryOnSession(req, res, next) {
  try {
    console.log(" TryOn Session Debug (JWT Mode):");
    
    const userId = req.user?._id;
    
    console.log("- User ID:", userId);
    console.log("- User authenticated:", !!req.user);
    console.log("- User email:", req.user?.email);

    if (!userId) {
      console.log(" User not authenticated - no userId found");
      req.tryOnSession = null;
      return next();
    }

    console.log(" User authenticated via JWT. Looking for TryOn session...");

    let tryOnSession = await TryOnSession.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      active: true,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 }); 

    console.log("- Found existing TryOnSession:", tryOnSession ? tryOnSession._id : "None");

    if (!tryOnSession) {
      console.log(" Creating new TryOn session for user:", userId);
      
      const deactivateResult = await TryOnSession.updateMany(
        { 
          userId: new mongoose.Types.ObjectId(userId), 
          active: true 
        },
        { 
          active: false,
          deactivatedAt: new Date()
        }
      );
      
      console.log("- Deactivated", deactivateResult.modifiedCount, "old sessions");


      const syntheticSessionId = new mongoose.Types.ObjectId();
      
      tryOnSession = await TryOnSession.create({
        sessionId: syntheticSessionId, 
        userId: new mongoose.Types.ObjectId(userId),
        queueId: `queue_${uuidv4()}`,
        active: true,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
      
      console.log("Created new TryOnSession:", tryOnSession._id);
      console.log("- Queue ID:", tryOnSession.queueId);
      console.log("- Expires at:", tryOnSession.expiresAt.toISOString());
    } else {
      console.log("Using existing TryOnSession:", tryOnSession._id);
      console.log("- Queue ID:", tryOnSession.queueId);
      console.log("- Session active until:", tryOnSession.expiresAt.toISOString());
      console.log("- Time remaining:", Math.round((tryOnSession.expiresAt - new Date()) / (1000 * 60 * 60)), "hours");
    }

    // Attach session to request
    req.tryOnSession = tryOnSession;
    console.log(" TryOn session attached to request");
    next();
    
  } catch (err) {
    console.error(" TryOn middleware error:", err.message);
    console.error("Stack:", err.stack);
    req.tryOnSession = null;
    next(); 
  }
};