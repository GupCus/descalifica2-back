import crypto from 'node:crypto'

export class Piloto{ 
    constructor(
        public name: string, 
        public team:string, 
        public num:number, 
        public nationality:string, 
        public role:string,
        public id= crypto.randomUUID()
    ) {}
}
//FRAN: hay q pasarlas a español
//AGUS: me gustan mas en inglés estas cosas