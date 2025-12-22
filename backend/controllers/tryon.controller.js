const axios = require("axios");
const Product = require("../models/Product.js");
const ApiError = require("../utils/apiError.js");
const catchAsync = require("../utils/catchAsync.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { addJob } = require("../queue/inMemoryQueue.js");
const { processTryOnQueue } = require("../utils/tryon.wroker.js");

const crypto = require("crypto");


exports.generateTryOn = catchAsync(async (req, res) => {
    console.log("Incoming try-on request received…");

    const { parentSku } = req.body;
    console.log("Validating request inputs…");

    if (!req.file) throw new ApiError(400, "userImage file is required");
    if (!parentSku) throw new ApiError(400, "parentSku is required");

    console.log(`Fetching products from database for parentSku: ${parentSku}`);
    const products = await Product.find({ "props.sku_parent": parentSku });
    if (!products.length) throw new ApiError(404, "Product not found");

    console.log(`Database returned ${products.length} matching products`);
    const product = products[0];
    console.log(`Using product SKU: ${product.sku} for try-on processing`);

    const productImageUrl = product.imgs?.[0]?.url;
    console.log(`Resolved product main image: ${productImageUrl}`);
    if (!productImageUrl) throw new ApiError(400, "No product image found");

    console.log("Calling Lambda to download product image…");
    const lambdaUrl = `https://6q6d5o99qa.execute-api.ap-south-1.amazonaws.com/prod/download?url=${encodeURIComponent(productImageUrl)}`;

    const lambdaResponse = await axios.get(lambdaUrl, { timeout: 8000 }).catch(err => {
        console.log("Lambda fetch failed:", err.message);
        return null;
    });

    if (!lambdaResponse?.data?.base64) {
        throw new ApiError(500, "Failed fetching product image");
    }

    console.log("Lambda returned Base64 successfully");

    let outfitB64 = lambdaResponse.data.base64
        .replace(/(\r\n|\n|\r)/gm, "")
        .replace(/"/g, "")
        .trim();

    console.log("Outfit Base64 length:", outfitB64.length);
    console.log("Outfit Base64 preview:", outfitB64.slice(0, 50), "...");

    console.log("Converting user image to Base64 format for Gemini API…");

    let userB64 = req.file.buffer.toString();

    // Detect if it is already clean base64 (e.g. starts with JPEG/PNG signatures)
    if (/^\/9j\//.test(userB64) || /^iVBORw0/.test(userB64)) {
        console.log("User image is already base64 — using directly");
    } else {
        console.log("User image is NOT raw base64 — converting once");
        userB64 = Buffer.from(req.file.buffer).toString("base64");
    }

    console.log("Final User Base64 length:", userB64.length);
    console.log("User Base64 preview:", userB64.slice(0, 50), "...");

    let userMime = req.file.mimetype || "image/jpeg";
    let outfitMime = lambdaResponse.data.contentType || "image/jpeg";

    if (userMime === "image/jpg") userMime = "image/jpeg";
    if (outfitMime === "image/jpg") outfitMime = "image/jpeg";

    console.log("User MIME:", userMime);
    console.log("Outfit MIME:", outfitMime);

    console.log("Initializing Gemini AI client…");
    const genAI = new GoogleGenerativeAI(process.env.GEMINIAI_API_KEY);

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image",
    });

    const prompt = `Perform a highly accurate virtual try-on using EXACTLY the outfit or item shown in the second image.
Apply the clothing or accessory from the second image onto the person in the first image WITHOUT changing:
- the person's face, skin tone, or body shape
- hairstyle, pose, or lighting
- background or environment

Use the second image strictly as the real item to overlay, with NO redesigning or artistic interpretation.

IMPORTANT CLOTHING RULES:
1. For full outfits (dresses, jumpsuits, gowns, lehengas, sarees, kurta-sets): Apply the entire outfit exactly as shown.
2. For tops (shirts, t-shirts, blouses, hoodies, jackets, sweaters): Overlay only the upper-body garment.
3. For bottoms (pants, jeans, leggings, skirts, shorts): Apply only waist-to-ankles area realistically.
4. For footwear:
   - If pair shown → apply to both feet
   - If one shoe shown → duplicate correctly
   - Ensure alignment and perspective accuracy
5. For one-sided accessories → apply only to that side.
6. For symmetrical accessories → apply to both sides equally.

Maintain EXACT:
- colors, shades, prints, logos
- texture, stitching, fabric folds
- shine, lighting reflection

STRICT RULES:
- Do NOT invent or modify any garment
- Do NOT change facial features or body shape
- Do NOT alter background or add elements
- Do NOT stylize, simplify, or redesign item

Goal: A highly realistic virtual try-on — as if the person actually wore the outfit in the original photo.`;

    console.log("Gemini AI model initialized successfully");
    console.log("Sending images to Gemini for try-on generation…");

    const aiResponse = await model.generateContent([
        { text: prompt },
        { inlineData: { data: userB64, mimeType: userMime } },
        { inlineData: { data: outfitB64, mimeType: outfitMime } }
    ]);

    let outputImage = null;

    for (const cand of aiResponse.response.candidates || []) {
        for (const part of cand.content.parts || []) {
            if (part.inlineData?.data) {
                outputImage = part.inlineData.data;
            }
        }
    }

    if (!outputImage) {
        console.log("Gemini response did not contain an image");
        throw new ApiError(500, "Gemini AI did not return an image");
    }

    console.log("Try-on output extracted successfully");
    console.log("Sending try-on response…");

    res.status(200).json({
        success: true,
        tryonImage: "data:image/png;base64," + outputImage,
        productImageUsed: productImageUrl
    });

    console.log("Try-on response sent successfully");
});



const { v4: uuidv4 } = require("uuid");
const TryOnJob = require("../models/TryOnJob");
const TryOnSession = require("../models/TryOnSession");
const Customer = require("../models/Customer");
const mongoose = require("mongoose");
const { activeQueues } = require("../queue/inMemoryQueue.js");

function fileToBase64(file) {
    if (!file || !file.buffer) return null;
    const mimeType = file.mimetype || 'image/jpeg';
    const base64 = file.buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
}

exports.saveUserImage = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                msg: "Please login to save your photo"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                msg: "User image file required"
            });
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                msg: "Invalid file type. Only JPG, PNG, WEBP allowed."
            });
        }

        if (req.file.size > 10 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                msg: "File too large. Maximum size is 10MB."
            });
        }

        const base64Image = fileToBase64(req.file);

        if (!base64Image) {
            return res.status(400).json({
                success: false,
                msg: "Failed to process image"
            });
        }

        // Save to user profile
        await Customer.findByIdAndUpdate(userId, {
            tryonimage: base64Image
        });

        res.json({
            success: true,
            message: "Photo saved successfully",
            hasImage: true
        });

    } catch (err) {
        console.error("Save user image error:", err);
        res.status(500).json({
            success: false,
            msg: "Server error"
        });
    }
};

exports.createTryOnQueue = async (req, res) => {
  try {
    let productImageUrls =
      req.body?.productImageUrls ||
      req.body?.["productImageUrls[]"];

    if (!productImageUrls) {
      return res.status(400).json({ success: false, message: "productImageUrls is required" });
    }

    if (!Array.isArray(productImageUrls)) {
      productImageUrls = [productImageUrls];
    }

    const tryOnSession = req.tryOnSession;
    const customer = await Customer.findById(tryOnSession.userId);

    if (!customer?.tryonimage) {
      return res.status(400).json({ success: false, message: "User try-on image missing" });
    }

    // 🔑 ONE QUEUE PER SESSION
    const queueId = tryOnSession.queueId || `queue_${crypto.randomUUID()}`;

    if (!tryOnSession.queueId) {
      tryOnSession.queueId = queueId;
      await tryOnSession.save();
    }

    // 🔑 Create jobs (dedupe)
    for (const url of productImageUrls) {
      await TryOnJob.updateOne(
        { queueId, productImageUrl: url },
        {
          $setOnInsert: {
            queueId,
            userId: tryOnSession.userId,
            tryonSessionId: tryOnSession._id,
            productImageUrl: url,
            userB64: customer.tryonimage,
            status: "pending"
          }
        },
        { upsert: true }
      );
    }

    // 🔑 Rehydrate memory queue
    if (!activeQueues[queueId]) {
      activeQueues[queueId] = { isProcessing: false };
    }

    // 🔥 Start worker ONCE
    if (!activeQueues[queueId].isProcessing) {
      activeQueues[queueId].isProcessing = true;
      processTryOnQueue(queueId);
    }

    return res.json({ success: true, queueId });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Queue creation failed" });
  }
};

exports.getQueueStatus = async (req, res) => {
  const jobs = await TryOnJob.find({ queueId: req.params.queueId });

  return res.json({
    queueId: req.params.queueId,
    completed: jobs
      .filter(j => j.status === "completed")
      .map(j => ({
        productImageUrl: j.productImageUrl,
        resultImage: j.result?.image || null
      })),
    failed: jobs.filter(j => j.status === "failed"),
    pendingCount: jobs.filter(j =>
      ["pending", "processing"].includes(j.status)
    ).length
  });
};




exports.checkUserImage = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                hasImage: false,
                msg: "User not logged in"
            });
        }

        const user = await Customer.findById(userId).select('tryonimage');

        res.json({
            success: true,
            hasImage: !!user?.tryonimage,
            message: user?.tryonimage ? "User has saved image" : "No saved image"
        });

    } catch (err) {
        console.error("Check user image error:", err);
        res.status(500).json({
            success: false,
            msg: "Server error"
        });
    }
};


exports.deleteUserImage = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                msg: "Please login"
            });
        }

        await Customer.findByIdAndUpdate(userId, {
            tryonimage: null
        });

        res.json({
            success: true,
            message: "Photo removed successfully",
            hasImage: false
        });

    } catch (err) {
        console.error("Delete user image error:", err);
        res.status(500).json({
            success: false,
            msg: "Server error"
        });
    }
};

exports.cleanupSessions = async (req, res) => {
    try {
        const result = await TryOnSession.deleteMany({
            expiresAt: { $lt: new Date() }
        });

        res.json({
            success: true,
            deleted: result.deletedCount,
            message: "Expired sessions cleaned up"
        });
    } catch (err) {
        console.error("Cleanup error:", err);
        res.status(500).json({ success: false, msg: "Cleanup failed" });
    }
};




// exports.addToTryOnQueue = async (req, res) => {
//     try {
//         const userId = req.user._id;
//         const tryOnSession = req.tryOnSession;

//         if (!tryOnSession) {
//             return res.status(400).json({ 
//                 success: false,
//                 msg: "Try-on session not active or expired. Please refresh the page." 
//             });
//         }

//         const { productImageUrls } = req.body;

//         let urls;
//         try {
//             urls = Array.isArray(productImageUrls)
//                 ? productImageUrls
//                 : JSON.parse(productImageUrls);
//         } catch {
//             return res.status(400).json({ 
//                 success: false, 
//                 msg: "Invalid productImageUrls format" 
//             });
//         }

//         // Get user image
//         const user = await Customer.findById(userId).select("tryonimage");
//         if (!user?.tryonimage) {
//             return res.status(400).json({ 
//                 success: false, 
//                 msg: "Please save your photo first" 
//             });
//         }

//         // Extract base64
//         const userB64 = user.tryonimage.replace(/^data:image\/\w+;base64,/, "");

//         // Create jobs
//         const jobs = urls.map(url => ({
//             queueId: tryOnSession.queueId,
//             sessionId: tryOnSession.sessionId,
//             userId,
//             tryonSessionId: tryOnSession._id,
//             productImageUrl: url,
//             userB64,
//             status: "pending"
//         }));

//         await TryOnJob.insertMany(jobs);

//         // Start processing async (optional - can be handled by worker)
//         // processQueueAsync(tryOnSession.queueId);

//         res.json({
//             success: true,
//             queueId: tryOnSession.queueId,
//             sessionId: tryOnSession._id,
//             added: jobs.length,
//             message: `${jobs.length} product(s) added to try-on queue`
//         });

//     } catch (err) {
//         console.error("Add to queue error:", err);
//         res.status(500).json({ 
//             success: false, 
//             msg: "Server error" 
//         });
//     }
// };

// exports.getQueueStatus = async (req, res) => {
//     try {
//         const { queueId } = req.params;
//         const tryOnSession = req.tryOnSession;

//         if (!tryOnSession || tryOnSession.queueId !== queueId) {
//             return res.status(403).json({ 
//                 success: false,
//                 msg: "Access denied or session expired" 
//             });
//         }

//         // Get all jobs for this session
//         const jobs = await TryOnJob.find({ 
//             queueId,
//             tryonSessionId: tryOnSession._id 
//         }).sort({ createdAt: 1 }).lean();

//         if (!jobs.length) {
//             return res.json({
//                 success: true,
//                 queueId,
//                 status: "empty",
//                 message: "No products in queue"
//             });
//         }

//         // Check for any pending jobs and process them
//         const pendingJobs = jobs.filter(j => j.status === "pending");

//         if (pendingJobs.length > 0) {
//             console.log(`Processing ${pendingJobs.length} pending jobs...`);

//             for (const job of pendingJobs) {
//                 try {
//                     await processSingleJob(job);
//                 } catch (err) {
//                     console.error(`Job ${job._id} failed:`, err.message);
//                 }
//             }

//             // Refresh jobs data
//             const updatedJobs = await TryOnJob.find({ 
//                 queueId,
//                 tryonSessionId: tryOnSession._id 
//             }).sort({ createdAt: 1 }).lean();

//             return formatQueueResponse(updatedJobs, queueId, res);
//         }

//         // If no pending jobs, return current status
//         formatQueueResponse(jobs, queueId, res);

//     } catch (err) {
//         console.error("Get queue status error:", err);
//         res.status(500).json({ 
//             success: false, 
//             msg: "Server error" 
//         });
//     }
// };

async function formatQueueResponse(jobs, queueId, res) {
    const pending = jobs.filter(j =>
        ["pending", "processing"].includes(j.status)
    );
    const completed = jobs.filter(j => j.status === "completed");
    const failed = jobs.filter(j => j.status === "failed");

    res.json({
        success: true,
        queueId,
        status: pending.length === 0 ? "completed" : "processing",
        total: jobs.length,
        pending: pending.length,
        completed: completed.length,
        failed: failed.length,
        results: {
            completed: completed.map(j => ({
                jobId: j._id,
                productImageUrl: j.productImageUrl,
                tryOnImage: j.result?.tryOnImage,
                createdAt: j.createdAt
            })),
            failed: failed.map(j => ({
                jobId: j._id,
                productImageUrl: j.productImageUrl,
                error: j.error,
                createdAt: j.createdAt
            })),
            pending: pending.map(j => ({
                jobId: j._id,
                productImageUrl: j.productImageUrl,
                status: j.status,
                createdAt: j.createdAt
            }))
        },
        message: pending.length > 0
            ? `Processing... ${pending.length} remaining`
            : "All jobs completed"
    });
}


async function processSingleJob(jobData) {
    try {
        // Update job status to processing
        await TryOnJob.findByIdAndUpdate(jobData._id, {
            status: "processing",
            lockedAt: new Date()
        });

        console.log(`Processing job ${jobData._id}`);

        // Call your AI processing function
        const result = await processTryOn({
            userB64: jobData.userB64,
            productImageUrl: jobData.productImageUrl
        });

        // Update job as completed
        await TryOnJob.findByIdAndUpdate(jobData._id, {
            status: "completed",
            result: result,
            lockedAt: null
        });

        console.log(`Job ${jobData._id} completed`);
        return { success: true };

    } catch (err) {
        console.error(`Job ${jobData._id} failed:`, err.message);

        await TryOnJob.findByIdAndUpdate(jobData._id, {
            status: "failed",
            error: err.message,
            lockedAt: null
        });

        return { success: false, error: err.message };
    }
}









































