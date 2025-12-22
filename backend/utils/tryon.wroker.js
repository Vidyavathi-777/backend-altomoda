const TryOnJob = require("../models/TryOnJob");
const { activeQueues } = require("../queue/inMemoryQueue");
const { fetchProductImageBase64 } = require("../services/lambda.service");
const { generateTryOnImage } = require("./geminiAi");

exports.processTryOnQueue = async (queueId) => {
  const queue = activeQueues[queueId];
  if (!queue) return;

  while (true) {
    const job = await TryOnJob.findOneAndUpdate(
      { queueId, status: "pending" },
      { status: "processing" },
      { new: true }
    );

    if (!job) {
      queue.isProcessing = false;
      return;
    }

    try {
      const productB64 = await fetchProductImageBase64(job.productImageUrl);

      const resultImage = await generateTryOnImage(
        job.userB64,
        productB64
      );

      await TryOnJob.updateOne(
        { _id: job._id },
        {
          status: "completed",
          result: { image: resultImage }
        }
      );

    } catch (err) {
      await TryOnJob.updateOne(
        { _id: job._id },
        { status: "failed", error: err.message }
      );
    }
  }
};
