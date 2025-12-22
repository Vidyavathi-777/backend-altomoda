// import axios from "axios";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// export const generateTryOnImage = async (userB64, outfitUrl, promptText) => {
//   try {
//     const genAI = new GoogleGenerativeAI(process.env.GEMINIAI_API_KEY);

//     // Download outfit (S3) image and convert to base64
//     const outfitResponse = await axios.get(outfitUrl, {
//       responseType: "arraybuffer"
//     });
//     const outfitB64 = Buffer.from(outfitResponse.data).toString("base64");

//     const model = genAI.getGenerativeModel({
//       model: "gemini-2.5-flash-image"
//     });



//     const aiResponse = await model.generateContent([
//       { text: promptText },

//       // User Image
//       {
//         inlineData: {
//           data: userB64,
//           mimeType: "image/jpeg"
//         }
//       },

//       // S3 Outfit Image
//       {
//         inlineData: {
//           data: outfitB64,
//           mimeType: "image/jpeg"
//         }
//       }
//     ]);

//     const output = aiResponse.response;

//     if (!output?.candidates) return null;

//     let outputImage = null;

//     // extract base64 output image
//     for (const cand of output.candidates) {
//       for (const part of cand.content.parts || []) {
//         if (part.inlineData?.data) outputImage = part.inlineData.data;
//       }
//     }

//     return outputImage;

//   } catch (err) {
//     console.error(" Gemini Error:", err);
//     return null;
//   }
// };



const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINIAI_API_KEY);

/**
 * Generates try-on image using Gemini
 * Prompt must remain unchanged
 */
exports.generateTryOnImage = async (userBase64, productBase64) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image"
  });

  const prompt = `
You are performing a REALISTIC VIRTUAL TRY-ON.

INPUT IMAGES:
- FIRST image: a real person photo
- SECOND image: a PRODUCT-ONLY image (flat lay or catalog)

TASK:
Overlay the clothing from the SECOND image onto the person in the FIRST image.

STRICT RULES:
- DO NOT generate new clothing
- DO NOT keep the original outfit
- REMOVE the person's original clothing
- APPLY the product garment exactly as shown
- Match size, position, sleeves, length
- Maintain original pose, face, body, background

GARMENT RULES:
- If top → replace upper body clothing ONLY
- If dress → replace entire outfit
- If jacket → layer over inner clothing

FAILURE IS NOT ALLOWED.
`;

  const result = await model.generateContent([
    prompt,
  {
    inlineData: {
      data: productBase64,
      mimeType: "image/png"
    }
  },
  {
    inlineData: {
      data: userBase64,
      mimeType: "image/png"
    }
  }
  ]);

  const imagePart = result.response.candidates?.[0]?.content?.parts?.find(
    p => p.inlineData
  );

  if (!imagePart) {
    throw new Error("Gemini did not return an image");
  }

  return imagePart.inlineData.data;
};
