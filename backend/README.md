# AltoModa Backend

The backend API for the AltoModa application, providing services for product management, virtual try-on, authentication, and order processing.

## Tech Stack
-   **Framework**: Express.js
-   **Database**: MongoDB (with Mongoose)
-   **AI/ML**: Google Gemini (Virtual Try-On), AWS Lambda (Image Processing)
-   **Deployment**: Vercel Serverless

## Key Features
-   Virtual Try-On with Gemini AI
-   Product Search & Filtering
-   User Authentication (JWT)
-   Cart & Order Management

## Deployment on Vercel

This project is configured for serverless deployment on **Vercel**.

### Configuration Rules
1.  **Entry Point**: `api/index.js` (Serverless Function Handler)
2.  **Config**: `vercel.json` manages routes, build settings, and global CORS headers.
3.  **CORS**: Explicit CORS headers are enforced in `vercel.json` to handle 401/Auth errors correctly without blocking the browser.

### URL Structure
-   API Base: `https://<your-vercel-domain>.vercel.app/api`
-   Try-On Endpoint: `/api/tryon`

## Environment Variables
Ensure these are set in your `.env` (locally) and Vercel Project Settings:
-   `PORT`
-   `MONGODB_URI`
-   `JWT_SECRET`
-   `GEMINIAI_API_KEY`
-   `AWS_ACCESS_KEY_ID`
-   `AWS_SECRET_ACCESS_KEY`
-   `LAMBDA_URL`

## Running Locally

```bash
# Install dependencies
npm install

# Run in dev mode
npm run dev
# The server entry point for local dev is src/server.js
```

## Troubleshooting
-   **CORS + 401 Error**: This usually means the request is unauthorized, and Vercel previously stripped the CORS headers. The updated `vercel.json` fixes this. Check your token/auth logic.
