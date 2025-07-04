import crypto from 'node:crypto'
import { Escuderia } from '../escuderia/escuderia.entity.mem.js';

export class Piloto{
    constructor(
        public name: string, 
        public team: Escuderia|undefined, 
        public nro:number, 
        public nationality:string, 
        public role:string,
        public id= crypto.randomUUID()
    ) {}
}
//FRAN: hay q pasarlas a español
//AGUS: me gustan mas en inglés estas cosas
//FRAN: las dejamos en inglés entonces