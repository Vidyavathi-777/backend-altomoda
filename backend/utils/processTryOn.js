const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Customer = require("../models/Customer");
const ApiError = require("./apiError");

module.exports = async function processTryOn({ userId, productImageUrl }) {
    console.log("Processing try-on for product:", productImageUrl);

    try {

        const user = await Customer.findById(userId).select("tryonimage");
        if (!user?.tryonimage) {
            throw new Error("User image not found");
        }
    
        const [meta, base64] = user.tryonimage.split(",");
        const mimeType = meta.match(/data:(.*);base64/)[1];
        // Download product image via Lambda
        const lambdaUrl = `https://6q6d5o99qa.execute-api.ap-south-1.amazonaws.com/prod/download?url=${encodeURIComponent(productImageUrl)}`;
        console.log("Calling Lambda:", lambdaUrl);
        
        const lambdaResponse = await axios.get(lambdaUrl, { timeout: 10000 });
        
        if (!lambdaResponse?.data?.base64) {
            throw new Error("Invalid response from Lambda - no base64 data");
        }

        let outfitB64 = lambdaResponse.data.base64
            .replace(/(\r\n|\n|\r)/gm, "")
            .replace(/"/g, "")
            .trim();

        const outfitMime = lambdaResponse.data.contentType || "image/jpeg";
        const userMime = "image/jpeg";

        console.log("Product image downloaded, size:", outfitB64.length);
        console.log("User image size:", userB64.length);

        // Initialize Gemini
        console.log("Initializing Gemini AI...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINIAI_API_KEY);
        
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-image",
        });

        const prompt = `You are performing a STRICT, REALISTIC virtual try-on.

INPUTS:
- Image 1: A real person photo (BASE IMAGE)
- Image 2: A real product photo (GARMENT IMAGE)

TASK:
Overlay the EXACT garment or accessory from Image 2 onto the person in Image 1.

ABSOLUTE RULES (MUST FOLLOW):
- NEVER invent, redesign, stylize, simplify, or reinterpret the garment.
- NEVER change the person’s face, skin tone, body shape, pose, hair, or background.
- NEVER alter lighting conditions except where strictly necessary for garment blending.
- NEVER add or remove garments, accessories, logos, or textures.
- NEVER skip applying the garment.

IF THE GARMENT IMAGE IS UNCLEAR:
- Infer placement ONLY from the visible garment structure.
- Do NOT hallucinate missing parts.
- Apply ONLY what is visible in the garment image.

GARMENT APPLICATION RULES (MANDATORY):

1. FULL OUTFITS (dress, jumpsuit, gown, saree, kurta set):
   - Apply the ENTIRE outfit.
   - Maintain exact drape, length, folds, and structure.

2. TOPS (shirt, t-shirt, blouse, hoodie, jacket, sweater):
   - Apply ONLY from shoulders to waist.
   - Preserve neckline shape, sleeve length, fit, and fabric folds.

3. BOTTOMS (pants, jeans, skirts, shorts, leggings):
   - Apply ONLY from waist to ankles.
   - Maintain exact rise, cut, taper, and length.

4. FOOTWEAR:
   - If one shoe is shown, DUPLICATE it symmetrically.
   - Align perfectly with feet perspective.

5. ACCESSORIES:
   - One-sided → apply only on that side.
   - Symmetrical → apply on both sides equally.

EDGE CASE HANDLING (CRITICAL):
- If garment is shown on a mannequin, REMOVE mannequin and apply garment only.
- If garment is flat-lay, reconstruct ONLY the visible shape.
- If garment is cropped, apply cropped length EXACTLY.
- If garment is folded, do NOT unfold — apply only visible area.
- If garment image is angled or rotated, align orientation correctly.

VISUAL FIDELITY REQUIREMENTS:
- Preserve EXACT colors, shades, prints, logos, textures.
- Preserve stitching, seams, folds, shine, and material thickness.
- Match perspective, scale, and body alignment precisely.

FINAL GOAL:
The result must look like the person in Image 1 is ACTUALLY wearing the REAL garment from Image 2 — no artistic interpretation, no imagination, no redesign.

FAILURE CONDITIONS (DO NOT ALLOW):
- Missing garment
- Wrong category placement
- Changed face or body
- Stylized or AI-looking output
- Altered background
`;

        console.log("Sending request to Gemini...");
        
        const aiResponse = await model.generateContent([
            { text: prompt },
            { 
                inlineData: { 
                    data: userB64, 
                    mimeType: userMime 
                } 
            },
            { 
                inlineData: { 
                    data: outfitB64, 
                    mimeType: outfitMime 
                } 
            }
        ]);

        console.log("Gemini response received");

        let outputImage = null;
        const candidates = aiResponse.response?.candidates || [];

        for (const cand of candidates) {
            for (const part of cand.content?.parts || []) {
                if (part.inlineData?.data) {
                    outputImage = part.inlineData.data;
                    break;
                }
            }
            if (outputImage) break;
        }

        if (!outputImage) {
            throw new Error("Gemini returned no image data");
        }

        console.log("Try-on generation successful!");

        return {
            productImageUrl,
            tryOnImage: "data:image/png;base64," + outputImage
        };

    } catch (err) {
        console.error("ProcessTryOn error:", err.message);
        throw err;
    }
};