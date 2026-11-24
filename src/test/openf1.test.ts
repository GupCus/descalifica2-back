import express from 'express';
import request from 'supertest';
import { of1router } from '../services/openf1/openf1.routes.js';
import { actualizarresultados } from '../services/openf1/openf1.service.js';

vi.mock('../shared/db/orm.js', () => ({ orm: {} }));
vi.mock('../auth/auth.middleware.js', () => ({
  authenticateAdmin: (req: any, res: any, next: any) => next(),
}));
vi.mock('../services/openf1/openf1.service.js', () => ({
  actualizarresultados: vi.fn(),
  destruirbd_importaropenf1: vi.fn(),
}));

const app = express();
app.use(express.json());
app.use('/api/openf1', of1router);

describe('POST /api/openf1/actualizarresultados/:id', () => {
  beforeEach(() => vi.mocked(actualizarresultados).mockReset());

  it('Debe actualizar la carrera elegida y no la última', async () => {
    vi.mocked(actualizarresultados).mockResolvedValue({
      id: 7,
      name: 'GP Mónaco',
    } as any);

    const response = await request(app).post(
      '/api/openf1/actualizarresultados/7',
    );

    expect(response.status).toBe(200);
    expect(actualizarresultados).toHaveBeenCalledWith(7);
  });

  it('Debe responder 400 si el id no es válido y no actualizar nada', async () => {
    for (const id of ['abc', '0', '-3', '1.5']) {
      const response = await request(app).post(
        `/api/openf1/actualizarresultados/${id}`,
      );
      expect(response.status).toBe(400);
    }
    expect(actualizarresultados).not.toHaveBeenCalled();
  });

  it('Debe responder 404 si la carrera no existe', async () => {
    vi.mocked(actualizarresultados).mockResolvedValue(undefined);
    const response = await request(app).post(
      '/api/openf1/actualizarresultados/999',
    );
    expect(response.status).toBe(404);
  });

  it('Sin id debe actualizar la última carrera', async () => {
    vi.mocked(actualizarresultados).mockResolvedValue({
      id: 3,
      name: 'GP Brasil',
    } as any);
    const response = await request(app).post(
      '/api/openf1/actualizarresultados/',
    );
    expect(response.status).toBe(200);
    expect(actualizarresultados).toHaveBeenCalledWith();
  });
});
