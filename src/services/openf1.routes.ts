// Endpoint Service

import { Request, Response, Router } from 'express';
import {
  asignarganadores,
  CargarPilotosyEscuderias,
  destruirbd_importaropenf1,
  fetchF1,
} from './openf1.service.js';
import { orm } from '../shared/db/orm.js';
import { Meetings } from './openf1.types/meetings.type.js';
import { Categoria } from '../categoria/categoria.entity.js';
import { Temporada } from '../temporada/temporada.entity.js';
import { Piloto } from '../piloto/piloto.entity.js';

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

// Endpoints para actualizar los conductores si estos llegan a cambiar, por ahora solo actualiza sus retratos
// TODO: solo hacerlo con los de la temporada actual
const openf1actualizarconductores = async (req: Request, res: Response) => {
  console.log('Actualizando conductores...');
  try {
    const em = orm.em.fork();
    const f1 = await em.findOne(Categoria, { name: 'F1' });
    if (f1) {
      await CargarPilotosyEscuderias(em, f1);
      await em.flush();
      res
        .status(200)
        .json({ message: 'Los conductores se han actualizado correctamente.' });
    } else {
      res.status(501).json({ message: 'Parece ser que no hay categorias' });
    }
  } catch (error: any) {
    console.error('Hubo un error:', error);
    res.status(500).json({ message: 'Error interno', error: error.message });
  }
};

//Luego de una carrera se deberían actualizar los campeones actuales
const openf1actualizarcampeones = async (req: Request, res: Response) => {
  console.log('Actualizando ganadores...');
  try {
    const em = orm.em.fork();
    const categorias = await em.find(Categoria, {}, { populate: ['seasons'] });
    for (const categoria of categorias) {
      const temporada = categoria.seasons.find((t) => t.year === 2026);
      if (temporada) {
        const meetings = (await fetchF1(
          '/meetings?year=' + temporada.year,
        )) as Meetings[];
        let ultimameeting = meetings[meetings.length - 1].meeting_key;
        const hoy = new Date();
        if (hoy.getFullYear() === temporada.year) {
          const carrerasOcurridas = meetings.filter(
            (meeting) => new Date(meeting.date_start) < hoy,
          );
          if (carrerasOcurridas.length > 0) {
            ultimameeting =
              carrerasOcurridas[carrerasOcurridas.length - 1].meeting_key;
          }
        }
        await asignarganadores(em, temporada, ultimameeting);
      }
    }

    await em.flush();

    res
      .status(200)
      .json({ message: 'Los campeones se han actualizado correctamente.' });
  } catch (error: any) {
    console.error('Hubo un error:', error);
    res.status(500).json({ message: 'Error interno', error: error.message });
  }
};

export const of1router = Router();
of1router.post('/actualizarcampeones', openf1actualizarcampeones);
of1router.post('/actualizarconductores', openf1actualizarconductores);
