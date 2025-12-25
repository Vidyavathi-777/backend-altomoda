const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINIAI_API_KEY);

exports.generateTryOnImage = async (userBase64, productBase64) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image"
  });

  const prompt = `
EXTREME REALISTIC VIRTUAL TRY-ON - PHYSICAL FITTING REQUIRED

You are a professional fashion designer and 3D clothing expert. Your task is to make the person PHYSICALLY WEAR the clothing, not just overlay it.

ANALYZE BOTH IMAGES:
- Identify the HUMAN BODY (pose, shape, contours)
- Identify the CLOTHING ITEM (type, fabric, structure)

STEP-BY-STEP FITTING PROCESS:

1. **BODY MAPPING**:
   - Detect the person's body shape: shoulders, chest, waist, hips
   - Map the 3D contours of their body
   - Identify their pose and posture

2. **CLOTHING WARPING**:
   - Warp and deform the clothing to match the body contours
   - Stretch/fold fabric to follow the 3D shape
   - Make sleeves wrap around arms, not float
   - Make torso area follow chest/waist curves
   - Create natural fabric tension and drape

3. **PHYSICAL INTEGRATION**:
   - The clothing must look PHYSICALLY ON the body
   - Show fabric being pulled by body parts
   - Create compression/stretch effects on tight areas
   - Show flow/drape effects on loose areas
   - Clothing should have volume and thickness

4. **STRUCTURAL FITTING**:
   - Necklines should sit properly on the neck/shoulders
   - Sleeves should end at correct wrist positions
   - Hems should fall at appropriate lengths
   - Seams should follow body lines
   - Buttons/zippers should align with body center

5. **REALISTIC TEXTURE**:
   - Fabric should appear to wrap around the 3D body
   - Show how different materials behave (stretchy, stiff, flowy)
   - Maintain pattern continuity across seams
   - Show texture distortion on stretched areas

6. **LIGHTING & SHADOWS**:
   - Add self-shadowing where clothing overlaps body
   - Create cast shadows from clothing onto body
   - Match ambient occlusion in fabric folds
   - Adjust fabric highlights based on body curvature

FINAL REQUIREMENT: The person must look like they are ACTUALLY WEARING the clothing - with proper fit, structure, and physical interaction between fabric and body. NOT an overlay, NOT a ghost image - REAL WEARING.
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
        data: userBase64.replace(/^data:image\/\w+;base64,/, ""),
        mimeType: "image/png"
      }
    }
  ]);

  const imagePart = result.response.candidates?.[0]?.content?.parts?.find(
    p => p.inlineData
  );

  if (!imagePart) {
    throw new Error("Gemini did not return image");
  }

  return imagePart.inlineData.data;
};
