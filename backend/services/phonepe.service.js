// // services/phonepe.service.js
// const axios = require('axios');
// const crypto = require('crypto');
// const config = require('../config/env');

// const axiosClient = axios.create({
//   baseURL: config.phonepe.baseUrl,
//   timeout: 10000,
// });

// function base64Encode(obj) {
//   return Buffer.from(JSON.stringify(obj)).toString('base64');
// }

// function computeSignature(payloadBase64, endpointPath = config.phonepe.payEndpointPath) {
//   const verifyString = `${payloadBase64}${endpointPath}${config.phonepe.saltKey}`;
//   const hash = crypto.createHash('sha256').update(verifyString).digest('hex');
//   return `${hash}###${config.phonepe.saltIndex}`;
// }

// // create payment (initiate)
// // NOTE: PhonePe docs are slightly inconsistent: some APIs expect { request: "<base64>" }, others { response: "<base64>" }.
// // We send { request: payloadBase64 } but keep the function flexible.
// async function createPayment(payload) {
//   const payloadBase64 = base64Encode(payload);
//   const xVerify = computeSignature(payloadBase64, config.phonepe.payEndpointPath);

//   const headers = {
//     'Content-Type': 'application/json',
//     'X-VERIFY': xVerify,
//     'X-MERCHANT-ID': config.phonepe.merchantId,
//   };

//   const body = { request: payloadBase64 };

//   const resp = await axiosClient.post(config.phonepe.payEndpointPath, body, { headers });
//   return resp.data;
// }

// // verify webhook
// function verifyWebhookSignature(base64Response, receivedXVerify) {
//   const verifyString = `${base64Response}${config.phonepe.saltKey}`;
//   const hash = crypto.createHash('sha256').update(verifyString).digest('hex');
//   const expected = `${hash}###${config.phonepe.saltIndex}`;

//   console.log('Verifying webhook signature:',{
//     receivedXVerify,expected, match:expected === receivedXVerify
//   });
//   try {
//     return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedXVerify));
//   } catch (e) {
//     return false;
//   }
// }

// function parseWebhookPayload(base64Response) {
//   const jsonStr = Buffer.from(base64Response, 'base64').toString('utf8');
//   console.log('Decoded webhook payload JSON string:', jsonStr);
//   return JSON.parse(jsonStr);
// }

// async function checkPaymentStatus(merchantTransactionId) {
//   const endpoint = `${config.phonepe.statusEndpointPath}/${config.phonepe.merchantId}/${merchantTransactionId}`;
//   const verifyString = `${endpoint}${config.phonepe.saltKey}`
//   const hash = crypto.createHash('sha256').update(verifyString).digest('hex');
//   const xverify = `${hash}###${config.phonepe.saltIndex}`;

//   const headers = {
//     'Content-Type': 'application/json',
//     'X-VERIFY': xverify,
//     'X-MERCHANT-ID': config.phonepe.merchantId,
//   };
//   console.log('Checking payment status with headers:', {
//     merchantTransactionId, endpoint, xverify
//   });
//   const resp = await axiosClient.get(endpoint, { headers });
//   return resp.data;
  
// }

// module.exports = {
//   createPayment,
//   verifyWebhookSignature,
//   parseWebhookPayload,
//   base64Encode,
//   computeSignature,
//   checkPaymentStatus,
// };

const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/env');

const axiosClient = axios.create({
  baseURL: config.phonepe.baseUrl,
  timeout: 10000,
});

// Encode object → Base64
function base64Encode(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}

// Compute signature for PhonePe
function computeSignature(payloadBase64, endpointPath = config.phonepe.payEndpointPath) {
  const verifyString = `${payloadBase64}${endpointPath}${config.phonepe.saltKey}`;
  const hash = crypto.createHash('sha256').update(verifyString).digest('hex');
  return `${hash}###${config.phonepe.saltIndex}`;
}

// ✅ Create Payment
async function createPayment(payload) {
  const payloadBase64 = base64Encode(payload);
  const xVerify = computeSignature(payloadBase64, config.phonepe.payEndpointPath);

  const headers = {
    'Content-Type': 'application/json',
    'X-VERIFY': xVerify,
    'X-MERCHANT-ID': config.phonepe.merchantId,
  };

  const body = { request: payloadBase64 };

  const resp = await axiosClient.post(config.phonepe.payEndpointPath, body, { headers });
  return resp.data;
}

// ✅ Verify webhook signature
function verifyWebhookSignature(base64Response, receivedXVerify) {
  const verifyString = `${base64Response}${config.phonepe.saltKey}`;
  const hash = crypto.createHash('sha256').update(verifyString).digest('hex');
  const expected = `${hash}###${config.phonepe.saltIndex}`;

  console.log('Verifying webhook signature:', {
    receivedXVerify,
    expected,
    match: expected === receivedXVerify
  });

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedXVerify));
  } catch {
    return false;
  }
}

// ✅ Decode webhook payload
function parseWebhookPayload(base64Response) {
  const jsonStr = Buffer.from(base64Response, 'base64').toString('utf8');
  return JSON.parse(jsonStr);
}

// ✅ Check Payment Status
async function checkPaymentStatus(merchantTransactionId) {
  const endpoint = `${config.phonepe.statusEndpointPath}/${config.phonepe.merchantId}/${merchantTransactionId}`;
  const verifyString = `${endpoint}${config.phonepe.saltKey}`;
  const hash = crypto.createHash('sha256').update(verifyString).digest('hex');
  const xverify = `${hash}###${config.phonepe.saltIndex}`;

  const headers = {
    'Content-Type': 'application/json',
    'X-VERIFY': xverify,
    'X-MERCHANT-ID': config.phonepe.merchantId,
  };

  console.log('Checking payment status with headers:', {
    merchantTransactionId,
    endpoint,
    xverify
  });

  const resp = await axiosClient.get(endpoint, { headers });
  return resp.data;
}

module.exports = {
  createPayment,
  verifyWebhookSignature,
  parseWebhookPayload,
  base64Encode,
  computeSignature,
  checkPaymentStatus,
};
