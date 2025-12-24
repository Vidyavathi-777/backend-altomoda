const axios = require("axios");

exports.fetchProductImageBase64 = async (imageUrl) => {
  const response = await axios.post(
    `${process.env.LAMBDA_URL}?url=${encodeURIComponent(imageUrl)}`
  );

  if (!response.data?.base64) {
    throw new Error("Lambda did not return base64");
  }

  return response.data.base64.replace(/^data:image\/\w+;base64,/, "");
};
