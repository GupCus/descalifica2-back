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
//FRAN: Es una entidad que representa un equipo de carreras, con propiedades como nombre, fundación, nacionalidad y motor. El ID se genera automáticamente para identificar de manera única cada escudería.
//FRAN: faltan los pilotos