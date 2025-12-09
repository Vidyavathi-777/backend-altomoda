const axios = require("axios");
const Product = require("../models/Product.js");
const ApiError = require("../utils/apiError.js");
const catchAsync = require("../utils/catchAsync.js");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// AWS CONFIG
const REGION = "ap-south-1";
const BUCKET = "altomoda-s3bucket";

const s3 = new S3Client({ region: REGION });

// const s3 = new S3Client({
//   region: REGION,
//   credentials: {
//     accessKeyId: "AKIAWOAVSUAB4OEWDM6L",
//     secretAccessKey: "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",
//   }
// });

exports.generateTryOn = catchAsync(async (req, res) => {
  const { parentSku } = req.body;

  if (!req.file) throw new ApiError(400, "userImage file is required");
  if (!parentSku) throw new ApiError(400, "parentSku is required");

  const products = await Product.find({ "props.sku_parent": parentSku });
  if (!products.length) throw new ApiError(404, "Product not found");

  const product = products[0];

  const productImageUrl = product.imgs?.[0]?.url;
  if (!productImageUrl) throw new ApiError(400, "No product image found");

  let s3Url = product.tryonImageUrl;

  if (!s3Url) {
    const imgResponse = await axios.get(productImageUrl, { responseType: "arraybuffer" });
    const imgBuffer = Buffer.from(imgResponse.data);

    const fileName = `tryon/${parentSku}.jpg`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileName,
        Body: imgBuffer,
        ContentType: "image/jpeg",
      })
    );

    s3Url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${fileName}`;

    await Product.updateMany(
      { "props.sku_parent": parentSku },
      { $set: { tryonImageUrl: s3Url } }
    );
  }

  const userB64 = req.file.buffer.toString("base64");

  const outfitResponse = await axios.get(productImageUrl, {
    responseType: "arraybuffer"
  });
  const outfitB64 = Buffer.from(outfitResponse.data).toString("base64");

  // GEMINI AI
  const genAI = new GoogleGenerativeAI(process.env.GEMINIAI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image",
  });

    const prompt = 
    "Perform a precise virtual try-on using EXACTLY the outfit/accessory provided in the second image. " +
    "Do NOT invent, change, or replace any clothing item. " +
    "Apply ONLY the item from the second image onto the person in the first image, preserving its real design, colors, shape, proportions, and texture. " +
    "Keep the person's original face, body, pose, skin tone, hairstyle, and lighting unchanged. " +
    "For full outfits (like dresses or jumpsuits), apply the entire outfit exactly as shown. " +
    "For single items (jackets, shirts, skirts, pants, shorts), overlay only that item naturally in the correct position. " +
    "For accessories (watches, belts, sunglasses, hats, bags, jewelry), place the accessory accurately where it belongs without altering the person. " +
    "Blend smoothly but DO NOT redesign, simplify, stylize, or modify the clothing or accessory. " +
    "Use the second image strictly as the exact item to apply.";

  const aiResponse = await model.generateContent([
    { text: prompt },
    {
      inlineData: { data: userB64, mimeType: "image/jpeg" }
    },
    {
      inlineData: { data: outfitB64, mimeType: "image/jpeg" }
    }
  ]);

  let outputImage = null;

  for (const cand of aiResponse.response.candidates || []) {
    for (const part of cand.content.parts || []) {
      if (part.inlineData?.data) outputImage = part.inlineData.data;
    }
  }

  if (!outputImage) throw new ApiError(500, "Gemini AI did not return an image");

  res.status(200).json({
    success: true,
    tryonImage: ("data:image/png;base64," + outputImage).trim(),
    productImageUsed: productImageUrl,
    tryonS3Url: s3Url,
  });
});
