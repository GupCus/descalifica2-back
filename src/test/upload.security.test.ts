import express, { Request, Response } from 'express';
import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import {
  uploadImageOptional,
  handleMulterErrors,
} from '../shared/upload/upload.middleware.js';
import { UPLOADS_BASE } from '../shared/upload/multer.config.js';
import { assetRouter } from '../asset/asset.routes.js';

const app = express();
app.post(
  '/api/test-upload',
  ...uploadImageOptional('misc', 'test-sec', 'avatar'),
  (req: Request, res: Response) => {
    res.status(200).json({
      filename: req.file?.filename,
      mimetype: req.file?.mimetype,
      path: req.file?.path,
    });
  },
);
app.use('/api/assets', assetRouter);
app.use(handleMulterErrors);

const TEST_DIR = path.join(UPLOADS_BASE, 'misc', 'test-sec');

// Minimal valid 1x1 PNG header + IHDR
const VALID_PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52,
]);

describe('Seguridad en subida y entrega de archivos (Upload & Assets)', () => {
  afterAll(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  it('Rechaza con 415 un archivo HTML camuflado con Content-Type: image/png y lo borra del disco', async () => {
    const htmlPayload = Buffer.from('<html><body><h1>Test</h1></body></html>');

    const res = await request(app)
      .post('/api/test-upload')
      .attach('avatar', htmlPayload, {
        filename: 'foto.html',
        contentType: 'image/png',
      });

    expect(res.status).toBe(415);

    const files = fs.existsSync(TEST_DIR) ? fs.readdirSync(TEST_DIR) : [];
    expect(files.length).toBe(0);
  });

  it('Rechaza con 415 archivos SVG (incluso con Content-Type: image/svg+xml o image/png)', async () => {
    const svgPayload = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
    );

    const resSvgMime = await request(app)
      .post('/api/test-upload')
      .attach('avatar', svgPayload, {
        filename: 'icon.svg',
        contentType: 'image/svg+xml',
      });
    expect(resSvgMime.status).toBe(415);

    const resSpoofedMime = await request(app)
      .post('/api/test-upload')
      .attach('avatar', svgPayload, {
        filename: 'icon.svg',
        contentType: 'image/png',
      });
    expect(resSpoofedMime.status).toBe(415);
  });

  it('Ignora la extensión original (.html) y asigna .png según los magic bytes reales, sirviéndolo con nosniff y Content-Disposition', async () => {
    const res = await request(app)
      .post('/api/test-upload')
      .attach('avatar', VALID_PNG_BYTES, {
        filename: 'exploit.html',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(200);
    expect(res.body.filename).toMatch(/\.png$/);
    expect(res.body.filename).not.toContain('.html');
    expect(res.body.mimetype).toBe('image/png');

    const assetRes = await request(app).get(
      `/api/assets/misc/test-sec/${res.body.filename}`,
    );
    expect(assetRes.status).toBe(200);
    expect(assetRes.headers['x-content-type-options']).toBe('nosniff');
    expect(assetRes.headers['content-disposition']).toContain('inline;');
    expect(assetRes.headers['content-security-policy']).toContain('sandbox');
    expect(assetRes.headers['content-type']).toContain('image/png');
  });
});
