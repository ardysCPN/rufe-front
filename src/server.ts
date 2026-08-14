import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import http from 'node:http';
import https from 'node:https';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Proxy API requests to the internal backend service.
 * Using native streaming http.request to transparently forward JSON, Multipart/FormData, and binary uploads
 * without corrupting boundaries or buffering large files in memory.
 */
app.use('/proxy-api', (req, res) => {
  const backendEnv = process.env['INTERNAL_BACKEND_URL'] || 'http://backend:8080';
  const backendUrl = new URL(backendEnv);

  // Forward all client headers except host/connection
  const forwardedHeaders: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (value && key !== 'host' && key !== 'connection') {
      forwardedHeaders[key] = value;
    }
  }
  forwardedHeaders['host'] = backendUrl.host;

  const requestOptions = {
    protocol: backendUrl.protocol,
    hostname: backendUrl.hostname,
    port: backendUrl.port || (backendUrl.protocol === 'https:' ? 443 : 8080),
    path: req.url, // req.url already has /proxy-api stripped
    method: req.method,
    headers: forwardedHeaders,
  };

  const client = backendUrl.protocol === 'https:' ? https : http;
  const proxyReq = client.request(requestOptions, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy Stream Error:', err);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Proxy Error', detail: 'Internal backend unreachable: ' + err.message });
    }
  });

  // Stream client request body directly into proxy request
  req.pipe(proxyReq, { end: true });
});

// Body-parser middleware for any other routes (placed after proxy-api)
app.use(express.json());

/**
 * Serve environment configuration for the client.
 */
app.get('/api/config', (req, res) => {
  res.json({
    apiUrl: process.env['API_URL'] || '/proxy-api'
  });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = Number(process.env['PORT'] || 4000);
  const host = '0.0.0.0';

  app.listen(port, host, () => {
    console.log(`Node Express server listening on http://${host}:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
