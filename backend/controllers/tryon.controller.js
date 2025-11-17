const axios = require("axios");

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

    // Validate URL format
    try {
      new URL(outfitUrl);
    } catch (urlError) {
      console.error("Invalid URL format:", outfitUrl);
      return res.status(400).json({
        success: false,
        message: "Invalid outfit URL format",
        receivedUrl: outfitUrl
      });
    }

    try {
      // console.log("Downloading outfit image from:", outfitUrl);

      const outfitResponse = await axios.get(outfitUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!outfitResponse.data || outfitResponse.data.length === 0) {
        throw new Error("Empty response from image URL");
      }

      outfitB64 = Buffer.from(outfitResponse.data, 'binary').toString('base64');
      console.log("Successfully downloaded outfit image, size:", outfitB64.length);

    } catch (downloadError) {
      console.error("Error downloading outfit image:", downloadError.message);
      return res.status(400).json({
        success: false,
        message: `Failed to download outfit image: ${downloadError.message}`,
        url: outfitUrl
      });
    }

    const prompt = {
      contents: [
        {
          parts: [
            {
              text:
                "Perform a precise virtual try-on using EXACTLY the outfit/accessory provided in the second image. " +
                // "Do NOT invent, change, or replace any clothing item. " +
                "Apply ONLY the item from the second image onto the person in the first image, preserving its real design, colors, shape, proportions, and texture. " +

                "Keep the person’s original face, body, pose, skin tone, hairstyle, and lighting unchanged. " +

                "For full outfits (like dresses or jumpsuits), apply the entire outfit exactly as shown. " +
                "For single items (jackets, shirts, skirts, pants, shorts), overlay only that item naturally in the correct position. " +
                "For accessories (watches, belts, sunglasses, hats, bags, jewelry), place the accessory accurately where it belongs without altering the person. " +

                "Blend smoothly but DO NOT redesign, simplify, stylize, or modify the clothing or accessory. " +
                "Use the second image strictly as the exact item to apply."

            },

            {
              inlineData: {
                mimeType: req.files.userImage[0].mimetype,
                data: userB64,
              },
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: outfitB64,
              },
            },
          ],
        },
      ],
    };

    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

    const response = await axios.post(apiUrl, prompt, {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINIAI_API_KEY,
      },
      timeout: 60000
    });

    // Extract inline base64 output
    let outputBase64 = null;

    const candidates = response.data?.candidates || [];
    for (const c of candidates) {
      const parts = c?.content?.parts || [];
      for (const p of parts) {
        if (p.inlineData?.data) {
          outputBase64 = p.inlineData.data;
        }
        if (p.inline_data?.data) {
          outputBase64 = p.inline_data.data;
        }
      }
    }

    if (!outputBase64) {
      return res.status(500).json({
        success: false,
        message: "No generated try-on image returned by Gemini",
      });
    }

    return res.status(200).json({
      success: true,
      image: `data:image/png;base64,${outputBase64}`,
    });
  } catch (error) {
    console.log("TRY ON ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Try-on generation failed",
      error: error.message,
    });
  }
};