import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Serve environment configuration for the client.
 */
app.get('/api/config', (req, res) => {
  res.json({
    apiUrl: process.env['API_URL'] || '/proxy-api'
  });
});

/**
 * Proxy API requests to the internal backend service.
 * This allows the backend to remain private within the Docker network.
 */
app.all('/proxy-api/:path*', async (req, res) => {
  const backendUrl = process.env['INTERNAL_BACKEND_URL'] || 'http://backend:8080';
  const targetPath = req.url.replace('/proxy-api', '');
  const targetUrl = `${backendUrl}${targetPath}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'content-type': String(req.headers['content-type'] || 'application/json'),
        'authorization': String(req.headers['authorization'] || ''),
        'x-tenant-id': String(req.headers['x-tenant-id'] || ''),
        'accept': String(req.headers['accept'] || '*/*'),
      },
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.arrayBuffer();
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.send(Buffer.from(data));
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(502).json({ error: 'Proxy Error', detail: 'Internal backend unreachable' });
  }
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
