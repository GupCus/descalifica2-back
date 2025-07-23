import { Entity, ManyToOne, Property, Rel } from '@mikro-orm/core';
import { baseEntity } from '../shared/baseEntity.entity.js';
import { Escuderia } from '../escuderia/escuderia.entity.js';

@Entity()
export class Piloto extends baseEntity{ 
        
        @ManyToOne(() => Escuderia, { nullable: false })
        //team!: Escuderia; DA ERROR, por ser una relacion circular. Se usa lo siguiente:
        team!: Rel<Escuderia>;
        @Property({nullable:false,unique:true})
        num!:number
        @Property({nullable:false})
        nationality!:string
        @Property({nullable:false})
        role!:string
}
//FRAN: hay q pasarlas a español
//AGUS: me gustan mas en inglés estas cosas