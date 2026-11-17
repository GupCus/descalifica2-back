import { NextFunction, Request, Response } from 'express';
import {
  actualizarresultados,
  destruirbd_importaropenf1,
} from './openf1.service.js';

//Luego de una sesion se deberian actualizar sus resultados
const openf1actualizarresultadoscarrera = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  /*
    #swagger.tags = ['Servicios: OpenF1']
    #swagger.summary = 'Actualizar resultados de una sesión desde OpenF1'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: { id: { type: 'integer', example: 1 } }
    }
    #swagger.responses[200] = { 
      description: 'Resultados actualizados',
      schema: { message: { type: 'string', example: 'Los resultados de la carrera se han actualizado correctamente.' } }
    }
    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  console.log('Actualizando resultados de la carrera...');
  try {
    await actualizarresultados(req.body.id);
    res.status(200).json({
      message: 'Los resultados de la carrera se han actualizado correctamente.',
    });
  } catch (error: any) {
    next(error);
  }
};

// Funcion para restablecer toda la BD desde openf1, no le brindo un endpoint por seguridad
const openf1restablecer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Restableciendo BD...');
  try {
    destruirbd_importaropenf1();
    res
      .status(202)
      .json({ message: 'Se dio inicio a la regeneración de la BD.' });
  } catch (error: any) {
    next(error);
  }
};

export { openf1actualizarresultadoscarrera };
