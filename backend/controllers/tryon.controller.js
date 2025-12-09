import axios from "axios";
import Product from "../models/Product.js";
import ApiError from "../utils/apiError.js";
import catchAsync from "../utils/catchAsync.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

export const generateTryOn = catchAsync(async (req, res) => {
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

  // 6️⃣ Generate try-on with Gemini
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
    tryonS3Url: s3Url, // stored for future use
  });
});
