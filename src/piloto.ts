import crypto from 'node:crypto'

export class Piloto{ //hay q pasarlas a español
    constructor(
        public name: string, 
        public team:string, 
        public nro:number, 
        public nationality:string, 
        public role:string,
        public id= crypto.randomUUID()
    ) {}
}