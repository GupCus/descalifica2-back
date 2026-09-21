import { Router, Request, Response } from 'express';
import { nationalities } from './nationalities.js';

export const nationalityRouter = Router();

nationalityRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'OK', data: nationalities });
});

nationalityRouter.get('/:code', (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const nationality = nationalities.find((n) => n.code === code);

  if (nationality) {
    res.status(200).json({ message: 'OK', data: nationality });
  } else {
    res.status(404).json({ message: 'Nacionalidad no encontrada' });
  }
});
