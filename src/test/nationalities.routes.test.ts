import express from 'express';
import request from 'supertest';
import { nationalityRouter } from '../shared/nationalities.routes.js';

//creo una mini app de Express en memoria para probar esta ruta

const app = express();
app.use(express.json());
app.use('/api/nationalities', nationalityRouter);

describe('Rutas de Nacionalidades', () => {
  //Camino Feliz

  it('GET /api/nationalities/:code debe devolver 200 y los datos de Argentina', async () => {
    // Simulo la petición GET
    const response = await request(app).get('/api/nationalities/ARG');

    // Verifico que la respuesta sea 200 y que los datos sean correctos
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      code: 'ARG',
      name: 'Argentina',
    });
  });

  // Camiino alternativo: Nacionalidad no encontrada
  it('GET /api/nationalities/:code debe devolver 404 si la nacionalidad no existe', async () => {
    //Pido un código de nacionalidad que no existe
    const response = await request(app).get('/api/nationalities/XYZ');

    // Verifico que la respuesta sea 404 y que el mensaje de error sea correcto
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Nacionalidad no encontrada');
  });
});
