import crypto from 'node:crypto';
import { Piloto } from '../piloto/piloto.entity.js';
import { Escuderia } from '../escuderia/escuderia.entity.js';

export class Circuito {
  constructor(
    public name: string,
    public country: string,
    public length: number,
    public year: number,
    //public driver: Piloto,
    //public team: Escuderia,
    public id = crypto.randomUUID()
  ) {}
}
