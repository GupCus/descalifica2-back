import crypto from 'node:crypto'
import { Escuderia } from '../escuderia/escuderia.entity.js';
import { Piloto } from '../piloto/piloto.entity.js';

export class Categoria{
    constructor(
        public name: string,
        public escuderias: Escuderia[]|undefined, //array de escuderías que pertenecen a la cat.
        public pilotos: Piloto[]|undefined, //array de pilotos que participan en la misma
        public id= crypto.randomUUID()
    ) {}
}