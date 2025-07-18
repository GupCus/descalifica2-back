import crypto from 'node:crypto'
import { Piloto } from '../piloto/piloto.entity.js';

export class Escuderia{ 
    constructor(
        public name: string,  
        public fundation:number, 
        public nationality:string, 
        public engine:string,
        public id:number,
        public pilotos:Piloto[],
    ) {}
}

//AGUS: ¿¿¿QUE HAY DE IMPORTANTE COMO PARA PONER???