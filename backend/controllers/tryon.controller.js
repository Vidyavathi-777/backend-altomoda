const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.generateTryOn = async (req, res) => {
  try {
    if (!req.files || !req.files.userImage || !req.body.outfitUrl) {
      return res.status(400).json({
        success: false,
        message: "userImage file and outfitUrl are required",
      });
    }

    const userBuf = req.files.userImage[0].buffer;
    const userB64 = userBuf.toString("base64");

    let outfitB64;
    const outfitUrl = req.body.outfitUrl;

    // Validate URL
    try {
      new URL(outfitUrl);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid outfit URL format",
      });
    }

    // Download outfit image
    try {
      const outfitResponse = await axios.get(outfitUrl, {
        responseType: "arraybuffer",
        timeout: 80000,
      });

      outfitB64 = Buffer.from(outfitResponse.data).toString("base64");
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Failed to download outfit image",
        error: error.message,
      });
    }

    // -------------------------------
    //     GEMINI PACKAGE USAGE
    // -------------------------------

    const genAI = new GoogleGenerativeAI(process.env.GEMINIAI_API_KEY);

    // Use the same model you were using before
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
    });

    const promptText =
      "Perform a precise virtual try-on using EXACTLY the outfit/accessory provided in the second image. " +
      // "Do NOT invent, change, or replace any clothing item. " +
      "Apply ONLY the item from the second image onto the person in the first image, preserving its real design, colors, shape, proportions, and texture. " +

      "Keep the person’s original face, body, pose, skin tone, hairstyle, and lighting unchanged. " +

      "For full outfits (like dresses or jumpsuits), apply the entire outfit exactly as shown. " +
      "For single items (jackets, shirts, skirts, pants, shorts), overlay only that item naturally in the correct position. " +
      "For accessories (watches, belts, sunglasses, hats, bags, jewelry), place the accessory accurately where it belongs without altering the person. " +

      "Blend smoothly but DO NOT redesign, simplify, stylize, or modify the clothing or accessory. " +
      "Use the second image strictly as the exact item to apply.";

    const aiResponse = await model.generateContent([
      { text: promptText },

      // User image
      {
        inlineData: {
          data: userB64,
          mimeType: req.files.userImage[0].mimetype,
        },
      },

      // Outfit image
      {
        inlineData: {
          data: outfitB64,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const output = aiResponse.response;

    if (!output || !output.candidates) {
      return res.status(500).json({
        success: false,
        message: "No response from Gemini model",
      });
    }

    // Extract base64 output image
    let outputBase64 = null;

    for (const candidate of output.candidates) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          outputBase64 = part.inlineData.data;
        }
      }
    }

    if (!outputBase64) {
      return res.status(500).json({
        success: false,
        message: "Generated image not found in response",
      });
    }

    return res.status(200).json({
      success: true,
      image: `data:image/png;base64,${outputBase64}`,
    });

  } catch (error) {
    console.error("TRY ON ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Try-on generation failed",
      error: error.message,
    });
  }
};
