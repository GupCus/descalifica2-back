import express from 'express';
import request from 'supertest';
import {
  ForeignKeyConstraintViolationException,
  NotFoundError,
  UniqueConstraintViolationException,
  ValidationError,
} from '@mikro-orm/core';
import { AppError, errorHandler } from '../shared/errors/error.middleware.js';
import { orm } from '../shared/db/orm.js';
import { findAll as findAllCategorias } from '../categoria/categoria.controller.js';

vi.mock('../shared/db/orm.js', () => ({
  orm: {
    em: {
      find: vi.fn(),
    },
  },
}));

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get('/test/sql-error', (_req, _res, next) => {
    const driverErr = new Error(
      "ER_NO_SUCH_TABLE: Table 'descalifica2.usuarios' doesn't exist at /srv/app/src/db.ts",
    );
    (driverErr as any).code = 'ER_NO_SUCH_TABLE';
    next(driverErr);
  });

  app.get('/test/not-found', (_req, _res, next) => {
    next(new NotFoundError('Usuario with id 999 not found in table usuarios'));
  });

  app.get('/test/unique-orm', (_req, _res, next) => {
    next(
      new UniqueConstraintViolationException(
        new Error("Duplicate entry 'admin@test.com' for key 'usuarios.email_unique'"),
      ),
    );
  });

  app.get('/test/unique-driver', (_req, _res, next) => {
    const err: any = new Error(
      "Duplicate entry 'F1' for key 'categoria.name_unique'",
    );
    err.code = 'ER_DUP_ENTRY';
    next(err);
  });

  app.get('/test/fk-orm', (_req, _res, next) => {
    next(
      new ForeignKeyConstraintViolationException(
        new Error(
          'Cannot delete or update a parent row: a foreign key constraint fails (`descalifica2`.`piloto`, CONSTRAINT `fk_team`)',
        ),
      ),
    );
  });

  app.get('/test/fk-driver', (_req, _res, next) => {
    const err: any = new Error(
      'Cannot delete or update a parent row: a foreign key constraint fails',
    );
    err.code = 'ER_ROW_IS_REFERENCED_2';
    next(err);
  });

  app.get('/test/validation', (_req, _res, next) => {
    next(new ValidationError('Invalid metadata on entity Piloto'));
  });

  app.get('/test/app-error', (_req, _res, next) => {
    next(new AppError(422, 'El parámetro enviado no es procesable.'));
  });

  app.get('/test/categorias', findAllCategorias);

  app.use(errorHandler);
  return app;
}

describe('Middleware global de manejo de errores', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debe responder 500 con correlationId y sin texto del driver ante un error SQL crudo', async () => {
    const app = createTestApp();
    const response = await request(app).get('/test/sql-error');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal server error');
    expect(response.body.correlationId).toMatch(UUID_V4_REGEX);

    const rawBody = JSON.stringify(response.body);
    expect(rawBody).not.toContain('ER_NO_SUCH_TABLE');
    expect(rawBody).not.toContain('descalifica2');
    expect(rawBody).not.toContain('usuarios');
    expect(rawBody).not.toContain('/srv/app');
    expect(response.body.error).toBeUndefined();
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('debe mapear NotFoundError de MikroORM a 404 sin filtrar detalles internos', async () => {
    const app = createTestApp();
    const response = await request(app).get('/test/not-found');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Resource not found');
    expect(JSON.stringify(response.body)).not.toContain('usuarios');
  });

  it('debe mapear UniqueConstraintViolationException y ER_DUP_ENTRY a 409 sin exponer índices', async () => {
    const app = createTestApp();

    const ormRes = await request(app).get('/test/unique-orm');
    expect(ormRes.status).toBe(409);
    expect(JSON.stringify(ormRes.body)).not.toContain('email_unique');
    expect(JSON.stringify(ormRes.body)).not.toContain('admin@test.com');

    const driverRes = await request(app).get('/test/unique-driver');
    expect(driverRes.status).toBe(409);
    expect(JSON.stringify(driverRes.body)).not.toContain('name_unique');
  });

  it('debe mapear ForeignKeyConstraintViolationException y ER_ROW_IS_REFERENCED_2 a 409 sin exponer tablas', async () => {
    const app = createTestApp();

    const ormRes = await request(app).get('/test/fk-orm');
    expect(ormRes.status).toBe(409);
    expect(JSON.stringify(ormRes.body)).not.toContain('fk_team');
    expect(JSON.stringify(ormRes.body)).not.toContain('descalifica2');

    const driverRes = await request(app).get('/test/fk-driver');
    expect(driverRes.status).toBe(409);
    expect(JSON.stringify(driverRes.body)).not.toContain('parent row');
  });

  it('debe mapear ValidationError de MikroORM a 400', async () => {
    const app = createTestApp();
    const response = await request(app).get('/test/validation');

    expect(response.status).toBe(400);
    expect(JSON.stringify(response.body)).not.toContain('Piloto');
  });

  it('debe respetar el statusCode y mensaje seguro de AppError', async () => {
    const app = createTestApp();
    const response = await request(app).get('/test/app-error');

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      message: 'El parámetro enviado no es procesable.',
    });
  });

  it('debe capturar un fallo de BD desde un controlador real (try/catch -> next) sin exponer error.message', async () => {
    const app = createTestApp();
    vi.spyOn(orm.em, 'find').mockRejectedValueOnce(
      new Error("ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'"),
    );

    const response = await request(app).get('/test/categorias');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal server error');
    expect(response.body.correlationId).toMatch(UUID_V4_REGEX);

    const rawBody = JSON.stringify(response.body);
    expect(rawBody).not.toContain('ER_ACCESS_DENIED_ERROR');
    expect(rawBody).not.toContain('root');
  });
});
