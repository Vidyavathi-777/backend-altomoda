// const axios = require("axios");
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// exports.generateTryOn = async (req, res) => {
//   try {
//     if (!req.files || !req.files.userImage || !req.body.outfitUrl) {
//       return res.status(400).json({
//         success: false,
//         message: "userImage file and outfitUrl are required",
//       });
//     }

//     const userBuf = req.files.userImage[0].buffer;
//     const userB64 = userBuf.toString("base64");

//     let outfitB64;
//     const outfitUrl = req.body.outfitUrl;

//     // Validate URL
//     try {
//       new URL(outfitUrl);
//     } catch {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid outfit URL format",
//       });
//     }

//     // Download outfit image
//     try {
//       const outfitResponse = await axios.get(outfitUrl, {
//         responseType: "arraybuffer",
//         timeout: 80000,
//       });

//       outfitB64 = Buffer.from(outfitResponse.data).toString("base64");
//     } catch (error) {
//       return res.status(400).json({
//         success: false,
//         message: "Failed to download outfit image",
//         error: error.message,
//       });
//     }

//     // -------------------------------
//     //     GEMINI PACKAGE USAGE
//     // -------------------------------

//     const genAI = new GoogleGenerativeAI(process.env.GEMINIAI_API_KEY);

//     // Use the same model you were using before
//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.5-flash-image",
//     });

//     const promptText =
//       "Perform a precise virtual try-on using EXACTLY the outfit/accessory provided in the second image. " +
//       // "Do NOT invent, change, or replace any clothing item. " +
//       "Apply ONLY the item from the second image onto the person in the first image, preserving its real design, colors, shape, proportions, and texture. " +

//       "Keep the person’s original face, body, pose, skin tone, hairstyle, and lighting unchanged. " +

//       "For full outfits (like dresses or jumpsuits), apply the entire outfit exactly as shown. " +
//       "For single items (jackets, shirts, skirts, pants, shorts), overlay only that item naturally in the correct position. " +
//       "For accessories (watches, belts, sunglasses, hats, bags, jewelry), place the accessory accurately where it belongs without altering the person. " +

//       "Blend smoothly but DO NOT redesign, simplify, stylize, or modify the clothing or accessory. " +
//       "Use the second image strictly as the exact item to apply.";

//     const aiResponse = await model.generateContent([
//       { text: promptText },

//       // User image
//       {
//         inlineData: {
//           data: userB64,
//           mimeType: req.files.userImage[0].mimetype,
//         },
//       },

//       // Outfit image
//       {
//         inlineData: {
//           data: outfitB64,
//           mimeType: "image/jpeg",
//         },
//       },
//     ]);

//     const output = aiResponse.response;

//     if (!output || !output.candidates) {
//       return res.status(500).json({
//         success: false,
//         message: "No response from Gemini model",
//       });
//     }

//     // Extract base64 output image
//     let outputBase64 = null;

//     for (const candidate of output.candidates) {
//       for (const part of candidate.content.parts) {
//         if (part.inlineData?.data) {
//           outputBase64 = part.inlineData.data;
//         }
//       }
//     }

//     if (!outputBase64) {
//       return res.status(500).json({
//         success: false,
//         message: "Generated image not found in response",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       image: `data:image/png;base64,${outputBase64}`,
//     });

//   } catch (error) {
//     console.error("TRY ON ERROR:", error.response?.data || error.message);

//     return res.status(500).json({
//       success: false,
//       message: "Try-on generation failed",
//       error: error.message,
//     });
//   }
// };



// const axios = require("axios");
// const { GoogleGenerativeAI } = require("@google/generative-ai");





// exports.generateTryOn = async (req, res) => {
//   try {
//     if (!req.files || !req.files.userImage || !req.body.outfitImageBase64) {
//       return res.status(400).json({
//         success: false,
//         message: "userImage and outfitImageBase64 are required.",
//       });
//     }

//     // Convert base64 to buffer
//     const base64Data = req.body.outfitImageBase64.replace(/^data:image\/\w+;base64,/, "");
//     const outfitBuf = Buffer.from(base64Data, 'base64');

//     const userBuf = req.files.userImage[0].buffer;
//     const userB64 = userBuf.toString("base64");
//     const outfitB64 = outfitBuf.toString("base64");

//     const genAI = new GoogleGenerativeAI(process.env.GEMINIAI_API_KEY);
//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.5-flash-image",
//     });

//     const promptText = "Your existing prompt...";

//     const aiResponse = await model.generateContent([
//       { text: promptText },
//       {
//         inlineData: {
//           data: userB64,
//           mimeType: req.files.userImage[0].mimetype,
//         },
//       },
//       {
//         inlineData: {
//           data: outfitB64,
//           mimeType: "image/jpeg",
//         },
//       },
//     ]);

//     const output = aiResponse.response;
//     let outputBase64 = null;

//     output?.candidates?.forEach(c => {
//       c.content?.parts?.forEach(p => {
//         if (p.inlineData?.data) {
//           outputBase64 = p.inlineData.data;
//         }
//       });
//     });

//     if (!outputBase64) {
//       return res.status(500).json({
//         success: false,
//         message: "No generated image found.",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       image: `data:image/png;base64,${outputBase64}`,
//     });

//   } catch (error) {
//     console.error("TRY ON ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Try-on generation failed.",
//       error: error.message,
//     });
//   }
// };




const sharp = require('sharp');
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.generateTryOn = async (req, res) => {
  try {
    if (!req.files || !req.files.userImage || !req.files.outfitImage) {
      return res.status(400).json({
        success: false,
        message: "Both userImage and outfitImage are required",
      });
    }

    // 🔥 OPTIMIZATION 1: Process images in parallel with optimization
    const [optimizedUserBuf, optimizedOutfitBuf] = await Promise.all([
      // Optimize user image
      sharp(req.files.userImage[0].buffer)
        .resize(768, 1024, {  // Reduced size for faster processing
          fit: 'cover',
          withoutEnlargement: true,
          fastShrinkOnLoad: true
        })
        .jpeg({ 
          quality: 80,  // Reduced quality for faster processing
          mozjpeg: true 
        })
        .toBuffer(),
      
      // Optimize outfit image
      sharp(req.files.outfitImage[0].buffer)
        .resize(512, 512, {  // Smaller size for outfit
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 80,
          mozjpeg: true 
        })
        .toBuffer()
    ]);

    const userB64 = optimizedUserBuf.toString("base64");
    const outfitB64 = optimizedOutfitBuf.toString("base64");

    const genAI = new GoogleGenerativeAI(process.env.GEMINIAI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
    });

    // 🔥 OPTIMIZATION 2: More concise prompt for faster processing
    const promptText = "Apply the clothing from second image to person in first image naturally. Keep face, body, and pose unchanged. Blend seamlessly.";

    // 🔥 OPTIMIZATION 3: Add timeout to prevent hanging
    const aiResponse = await Promise.race([
      model.generateContent([
        { text: promptText },
        {
          inlineData: {
            data: userB64,
            mimeType: "image/jpeg", // Force consistent format
          },
        },
        {
          inlineData: {
            data: outfitB64,
            mimeType: "image/jpeg",
          },
        },
      ]),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Generation timeout - taking too long')), 45000) // 45s timeout
      )
    ]);

    let outputImage = null;
    const output = aiResponse.response;
    
    output?.candidates?.forEach((c) => {
      c.content.parts.forEach((p) => {
        if (p.inlineData?.data) outputImage = p.inlineData.data;
      });
    });

    if (!outputImage) {
      return res.status(500).json({
        success: false,
        message: "No output image received from AI",
      });
    }

    // 🔥 OPTIMIZATION 4: Send immediate response
    res.json({
      success: true,
      image: `data:image/png;base64,${outputImage}`,
    });

  } catch (error) {
    console.error("Try-on Error:", error.message);
    
    // Handle timeout specifically
    if (error.message.includes('timeout')) {
      return res.status(408).json({
        success: false,
        message: "Try-on generation taking too long. Please try with different images.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Try-on generation failed",
      error: error.message,
    });
  }
};

exports.proxyImage = async (req, res) => {
  try {
    const imageUrl = req.query.url;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL required" });
    }

    // 🔥 OPTIMIZATION 5: Faster image proxy with compression
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30000, // Reduced timeout
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "image/*"
      }
    });

    const contentType = response.headers["content-type"] || "image/jpeg";
    
    // Compress images before proxying
    if (contentType.startsWith('image/')) {
      const optimizedImage = await sharp(response.data)
        .resize(800, 800, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 75 })
        .toBuffer();
      
      res.set("Content-Type", "image/jpeg");
      res.send(optimizedImage);
    } else {
      res.set("Content-Type", contentType);
      res.send(response.data);
    }

  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({ 
      message: "Failed to download image", 
      error: err.message 
    });
  }
};