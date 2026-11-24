import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';
import {
  ForeignKeyConstraintViolationException,
  NotFoundError,
  UniqueConstraintViolationException,
  ValidationError,
} from '@mikro-orm/core';

/**
 * Error HTTP controlado para respuestas de aplicación seguras hacia el cliente.
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Middleware global de manejo de errores.
 * Mapea errores conocidos de MikroORM/MySQL a códigos HTTP apropiados
 * y evita exponer mensajes internos o del driver en errores 500.
 */
export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (res.headersSent) {
    return;
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err?.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ message: 'JSON inválido en el cuerpo de la solicitud.' });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ message: 'Resource not found' });
  }

  if (
    err instanceof UniqueConstraintViolationException ||
    err?.code === 'ER_DUP_ENTRY'
  ) {
    return res.status(409).json({
      message: 'El registro ya existe o viola una restricción de unicidad.',
    });
  }

  if (
    err instanceof ForeignKeyConstraintViolationException ||
    err?.code === 'ER_ROW_IS_REFERENCED_2' ||
    err?.code === 'ER_NO_REFERENCED_ROW_2' ||
    (typeof err?.message === 'string' &&
      err.message.includes('foreign key constraint fails'))
  ) {
    return res.status(409).json({
      message:
        'No se puede completar la operación porque existen registros relacionados.',
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({ message: 'Datos de entrada inválidos.' });
  }

  const correlationId = crypto.randomUUID();
  console.error(
    `[Error ${correlationId}] ${req.method} ${req.originalUrl}:`,
    err,
  );

  return res.status(500).json({
    message: 'Internal server error',
    correlationId,
  });
};
