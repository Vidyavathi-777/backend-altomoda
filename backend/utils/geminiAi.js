import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateTryOnImage = async (userB64, outfitUrl, promptText) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINIAI_API_KEY);

    // Download outfit (S3) image and convert to base64
    const outfitResponse = await axios.get(outfitUrl, {
      responseType: "arraybuffer"
    });
    const outfitB64 = Buffer.from(outfitResponse.data).toString("base64");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image"
    });

    const aiResponse = await model.generateContent([
      { text: promptText },

      // User Image
      {
        inlineData: {
          data: userB64,
          mimeType: "image/jpeg"
        }
      },

      // S3 Outfit Image
      {
        inlineData: {
          data: outfitB64,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const output = aiResponse.response;

    if (!output?.candidates) return null;

    let outputImage = null;

    // extract base64 output image
    for (const cand of output.candidates) {
      for (const part of cand.content.parts || []) {
        if (part.inlineData?.data) outputImage = part.inlineData.data;
      }
    }

    return outputImage;

  } catch (err) {
    console.error(" Gemini Error:", err);
    return null;
  }
};
