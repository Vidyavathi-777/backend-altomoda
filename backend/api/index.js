const app = require('../src/app');
const connectDB = require('../config/db');
const { activeQueues } = require('../queue/inMemoryQueue');

// Initialize DB connection once
let isConnected = false;

const dbConnection = async () => {
    if (isConnected) return;
    await connectDB();
    isConnected = true;
};

// Vercel serverless function handler
module.exports = async (req, res) => {
    await dbConnection();

    // Ensure the worker definition is loaded for queue processing (if using in-memory in serverless - though limited)
    require('../utils/tryon.wroker');

    app(req, res);
};
