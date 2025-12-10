const axios = require("axios");
const Product = require("../models/Product.js");
const ApiError = require("../utils/apiError.js");
const catchAsync = require("../utils/catchAsync.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");


exports.generateTryOn = catchAsync(async (req, res) => {
  console.log("Incoming try-on request received…");
  //  addLog("Incoming try-on request received…");
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

  let base64ProductImage = null;

  // if (product.tryonImageUrl && !product.tryonImageUrl.startsWith("http")) {
  //   console.log("Valid Base64 found in DB for try-on image");
  //   base64ProductImage = product.tryonImageUrl;
  //   console.log(base64ProductImage)
  // } else {
    console.log("No valid Base64 in DB. Calling Lambda to download product image…");

    const lambdaUrl =
      `https://6q6d5o99qa.execute-api.ap-south-1.amazonaws.com/prod/download?url=${encodeURIComponent(productImageUrl)}`;

    const lambdaResponse = await axios.get(lambdaUrl, { timeout: 5000 }).catch(() => null);
    // console.log("lambda Response :" , lambdaResponse)
    // console.log("1",lambdaResponse.data)
    // // console.log("2",lambdaResponse.data.base64)

    // if (!lambdaResponse || !lambdaResponse.data?.base64) {
    //   console.log("Lambda failed — using axios fallback…");

    //   const img = await axios.get(productImageUrl, { responseType: "arraybuffer" });
    //   base64ProductImage = Buffer.from(img.data).toString("base64");
    // } else {
      base64ProductImage = lambdaResponse.data.base64;
      // console.log("product image", base64ProductImage)
    // }

    // base64ProductImage = lambdaResponse.data.base64;

    console.log("Lambda returned Base64 successfully")

    // console.log("Updating product variants with tryonImageUrl .... ")
    // await Product.updateMany(
    //   { "props.sku_parent": parentSku },
    //   { $set: { tryonImageUrl: base64ProductImage } }
    // )

    // console.log("Database updated successfully")
  // }

  console.log("Converting user image to Base64 format for Gemini API…");
  const userB64 = req.file.buffer.toString("base64");



  console.log("Product image for gemiai")

  const outfitB64 = base64ProductImage


  console.log("Initializing Gemini AI client…");
  const genAI = new GoogleGenerativeAI(process.env.GEMINIAI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image",
  });

  const prompt =
    `Perform a highly accurate virtual try-on using EXACTLY the outfit or item shown in the second image.
Apply the clothing or accessory from the second image onto the person in the first image WITHOUT changing:
- the person's face, skin tone, or body shape
- hairstyle, pose, or lighting
- background or environment
Use the second image strictly as the real item to overlay, with NO redesigning or artistic interpretation.
IMPORTANT CLOTHING RULES:
1. For full outfits (dresses, jumpsuits, gowns, lehengas, sarees, kurta-sets): Apply the entire outfit exactly as shown, covering the complete body appropriately.
2. For tops (shirts, t-shirts, blouses, hoodies, jackets, sweaters): Overlay only the upper-body garment naturally aligned to the person's torso.
3. For bottoms (pants, jeans, leggings, skirts, shorts): Apply the exact bottom garment proportionally from waist to ankles.
4. For shoes/footwear (heels, sandals, sneakers, boots, flats):
   - Replace BOTH shoes completely when the second image shows a pair
   - Apply the EXACT same shoe to BOTH feet with proper symmetry
   - Ensure accurate alignment with both feet/ankles
   - If only one shoe is shown in the reference, apply that same design to both feet
5. For one-sided accessories (single earring, one glove):
   - Apply only to the correct side as shown
   - Do NOT mirror or duplicate to the other side
6. For symmetrical accessories (pairs):
   - Apply to both sides equally and symmetrically
7. Maintain EXACT colors, patterns, textures, embroidery, shine, and fabric structure from the second image.
STRICT RULES:
- NEVER invent, change, or replace any garments or accessories
- NEVER modify colors, shapes, proportions, logos, or prints
- NEVER generate new backgrounds or poses
- NEVER stylize or simplify the item
- ALWAYS use the second image as the exact product to apply
- For footwear: ALWAYS ensure both shoes match exactly as shown in the reference
- Blend realistically with high detail and clean edges
`;

  console.log("Gemini AI model initialized successfully");

  console.log("Sending user image + outfit image to Gemini AI for try-on generation…");

  const aiResponse = await model.generateContent([
    { text: prompt },
    { inlineData: { data: userB64, mimeType: "image/jpeg" } },
    { inlineData: { data: outfitB64, mimeType: "image/jpeg" } }
  ]);

  let outputImage = null;

  for (const cand of aiResponse.response.candidates || []) {
    for (const part of cand.content.parts || []) {
      if (part.inlineData?.data) {
        outputImage = part.inlineData.data;
        console.log("Try-on output image extracted successfully from AI response");
      }
    }

  }

  if (!outputImage) {
    console.log("Gemini response did not contain an output image");
    throw new ApiError(500, "Gemini AI did not return an image");
  }

  console.log("Sending try-on repsonse")


  res.status(200).json({
    success: true,
    tryonImage: "data:image/png;base64," + outputImage,
    productImageUsed: productImageUrl,
    storedBase64: !!product.tryonImageUrl,
  });

  console.log("Try-on response sent successfully");

});
