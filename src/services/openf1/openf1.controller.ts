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
    #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer', example: 1 }
    #swagger.responses[200] = { 
      description: 'Resultados actualizados',
      schema: { message: { type: 'string', example: 'Los resultados de la carrera se han actualizado correctamente.' } }
    }
    #swagger.responses[400] = { 
      description: 'Error en los parametros',
    }
    #swagger.responses[404] = { 
      description: 'No se encontró',
    }

    #swagger.responses[500] = { schema: { $ref: '#/components/schemas/ErrorServer' } }
  */
  console.log('Actualizando resultados de la carrera...');
  try {
    let carrera;
    if (req.params.id) {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: 'El id de la carrera debe ser un entero positivo.',
        });
      }
      carrera = await actualizarresultados(id);
    } else {
      carrera = await actualizarresultados();
    }
    if (carrera) {
      res.status(200).json({
        message:
          'Los resultados de la carrera ' +
          carrera.name +
          ' se han actualizado correctamente.',
      });
    } else {
      return res.status(404).json({ message: 'No se encontró la carrera.' });
    }
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
