import { Router, Request, Response } from 'express';
import { nationalities } from './nationalities.js';

export const nationalityRouter = Router();

nationalityRouter.get('/', (req: Request, res: Response) => {
  /*
    #swagger.tags = ['Nacionalidades']
    #swagger.summary = 'Obtener todas las nacionalidades'
    #swagger.responses[200] = { 
      description: 'OK',
      schema: { 
        message: { type: 'string', example: 'OK' }, 
        data: [{ 
          code: { type: 'string', example: 'ARG' },
          name: { type: 'string', example: 'Argentina' }
        }] 
      }
    }
  */
  res.status(200).json({ message: 'OK', data: nationalities });
});

nationalityRouter.get('/:code', (req: Request, res: Response) => {
  /*
    #swagger.tags = ['Nacionalidades']
    #swagger.summary = 'Obtener nacionalidad por código'
    #swagger.responses[200] = { 
      description: 'OK',
      schema: { 
        message: { type: 'string', example: 'OK' }, 
        data: { 
          code: { type: 'string', example: 'ARG' },
          name: { type: 'string', example: 'Argentina' }
        }
      }
    }
    #swagger.responses[404] = { schema: { $ref: '#/components/schemas/NotFound' } }
  */
  const code = req.params.code.toUpperCase();
  const nationality = nationalities.find((n) => n.code === code);

  if (nationality) {
    res.status(200).json({ message: 'OK', data: nationality });
  } else {
    res.status(404).json({ message: 'Nacionalidad no encontrada' });
  }
});
