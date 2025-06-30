import crypto from 'node:crypto'

export class Escuderia{ 
    constructor(
        public name: string,  
        public fundation:number, 
        public nationality:string, 
        public engine:string,
        public id= crypto.randomUUID()
    ) {}
}

//AGUS: ¿¿¿QUE HAY DE IMPORTANTE COMO PARA PONER???