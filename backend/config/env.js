require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  phonepe: {
    merchantId: process.env.PHONEPE_MERCHANT_ID,
    saltKey: process.env.PHONEPE_SALT_KEY,
    saltIndex: process.env.PHONEPE_SALT_INDEX,
    baseUrl: process.env.PHONEPE_BASE_URL,
    webhookUrl: process.env.PHONEPE_WEBHOOK_URL,
    redirectUrl: process.env.PHONEPE_REDIRECT_URL,
    payEndpointPath: process.env.PHONEPE_PAY_ENDPOINT_PATH || '/pg/v1/pay',
  },

  cloudstore: {
    baseUrl: process.env.CLOUDSTORE_BASE_URL || 'https://sandbox.csplatform.io:9950',
    shopAuthToken: process.env.CLOUDSTORE_SHOP_TOKEN, // format merchantId-shopId:token
    timeoutMs: Number(process.env.CLOUDSTORE_TIMEOUT_MS || 8000),
    retryAttempts: Number(process.env.CLOUDSTORE_RETRY_ATTEMPTS || 3),
  },
  axiosDefaults: {
    timeout: Number(process.env.AXIOS_TIMEOUT_MS || 10000),
  },
};
