import { Request, Response } from 'express';
import {
  actualizarresultados,
  destruirbd_importaropenf1,
} from './openf1.service.js';

//Luego de una sesion se deberian actualizar sus resultados
const openf1actualizarresultadoscarrera = async (
  req: Request,
  res: Response,
) => {
  console.log('Actualizando resultados de la carrera...');
  try {
    await actualizarresultados(req.body.id);
    res.status(200).json({
      message: 'Los resultados de la carrera se han actualizado correctamente.',
    });
  } catch (error: any) {
    console.error('Hubo un error:', error);
    res.status(500).json({ message: 'Error interno', error: error.message });
  }
};

// Funcion para restablecer toda la BD desde openf1, no le brindo un endpoint por seguridad
const openf1restablecer = async (req: Request, res: Response) => {
  console.log('Restableciendo BD...');
  try {
    destruirbd_importaropenf1();
    res
      .status(202)
      .json({ message: 'Se dio inicio a la regeneración de la BD.' });
  } catch (error: any) {
    console.error('Hubo un error:', error);
    res.status(500).json({ message: 'Error interno', error: error.message });
  }
};

export { openf1actualizarresultadoscarrera };
