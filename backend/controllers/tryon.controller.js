const axios = require("axios");
const Product = require("../models/Product.js");
const ApiError = require("../utils/apiError.js");
const catchAsync = require("../utils/catchAsync.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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
    productImageUsed: productImageUrl,
    storedBase64: !!product.tryonImageUrl,
  });

  console.log("Try-on response sent successfully");
});
