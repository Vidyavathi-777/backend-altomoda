const axios = require("axios");

// const LAMBDA_URL = https://6q6d5o99qa.execute-api.ap-south-1.amazonaws.com/prod/download?url=;

/**
 * Fetch product image base64 using Lambda
 */
exports.fetchProductImageBase64 = async (imageUrl) => {
    const response = await axios.post(`https://6q6d5o99qa.execute-api.ap-south-1.amazonaws.com/prod/download?url=${encodeURIComponent(imageUrl)}`);

    if (!response.data || !response.data.base64) {
        throw new Error("Lambda did not return base64 image");
    }

    return response.data.base64.replace(/^data:image\/[a-z]+;base64,/, "");
};
