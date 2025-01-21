const express = require('express');
const corsAnywhere = require('cors-anywhere');
const rateLimit = require('express-rate-limit');

// Set up the rate limiting: 5 requests per 20 seconds by default
const limiter = rateLimit({
  windowMs: 20000, // 20 seconds
  max: 5, // Limit each user to 5 requests per window
  statusCode: 429, // Return 429 status code when rate limit is exceeded
  message: '', // No message
});

// Create an Express app
const app = express();

// Rate limit middleware conditionally
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const hostname = origin ? new URL(origin).hostname : 'No origin';
  if (req.headers['x-auth-user'] === process.env.AUTH_USER || hostname === 'localhost') {
    return next();
  }
  limiter(req, res, next);
});

// Root route serving plain text with text/plain content type
app.all('/', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(`This API enables cross-origin requests to anywhere.

Usage:
/               Shows help
/iscorsneeded   This is the only resource on this host which is served without CORS headers.
/<url>          Create a request to <url>, and includes CORS headers in the response.


Limits:
- 5 requests per 20 seconds per IP
- No limitation on localhost

For more info, see: https://github.com/AtharvaKolekar/cors-anywhere
    `);
  });

const host = 'localhost';
const port = process.env.PORT || 8080;

// Create the CORS Anywhere server
const server = corsAnywhere.createServer({
  originWhitelist: [], // Allows all origins
  requireHeaders: [],
  removeHeaders: ['cookie', 'cookie2'], // Remove sensitive headers
});

// Use Express to handle incoming requests and apply rate limiting first
app.all('*', (req, res) => {
  server.emit('request', req, res);
});

// Start the server
app.listen(port, host, () => {
  console.log(`CORS Anywhere with rate limiting is running on ${host}:${port}`);
});
