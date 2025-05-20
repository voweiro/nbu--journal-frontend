/**
 * CORS Proxy for Development
 * 
 * This utility creates a proxy for API requests to avoid CORS issues during development.
 * It uses the 'http-proxy-middleware' package which should be installed:
 * npm install http-proxy-middleware --save-dev
 */

const { createProxyMiddleware } = require('http-proxy-middleware');

// Export the proxy middleware configuration for Next.js
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://nbu-journal-backend.onrender.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // No path rewriting needed in this case
      },
      headers: {
        'Connection': 'keep-alive'
      },
      // Log proxy activity during development
      onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`[Proxy] ${proxyRes.statusCode} ${req.method} ${req.url}`);
      },
      onError: (err, req, res) => {
        console.error('[Proxy] Error:', err);
      }
    })
  );
};
