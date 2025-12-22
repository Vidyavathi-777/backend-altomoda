// const jobQueue = [];
// let isProcessing = false;

// function addJob({ data, handler, resolve, reject }) {
//   jobQueue.push({ data, handler, resolve, reject });
//   processQueue();
// }

// async function processQueue() {
//   if (isProcessing) return;
//   isProcessing = true;

//   while (jobQueue.length > 0) {
//     const job = jobQueue.shift();

//     try {
//       const result = await job.handler(job.data);
//       job.resolve(result);
//     } catch (err) {
//       job.reject(err);
//     }
//   }

//   isProcessing = false;
// }

// module.exports = { addJob };


/**
 * In-memory queue store
 * Dev-only (same as ILikeItPublicApis)
 */
const activeQueues = {};

module.exports = { activeQueues };

