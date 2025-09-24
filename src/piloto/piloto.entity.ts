import { Cascade, Entity, ManyToOne, Property, Rel } from '@mikro-orm/core';
import { baseEntity } from '../shared/baseEntity.entity.js';
import { Escuderia } from '../escuderia/escuderia.entity.js';
import { Categoria } from '../categoria/categoria.entity.js';

@Entity()
export class Piloto extends baseEntity{ 
        
        @ManyToOne(() => Escuderia, { nullable: false })
        //team!: Escuderia; DA ERROR, por ser una relacion circular. Se usa lo siguiente:
        escuderia!: Rel<Escuderia>;
        @Property({nullable:false,unique:true})
        num!:number
        @Property({nullable:false})
        nationality!:string
        @Property({nullable:false})
        role!:string
        @ManyToOne(() => Categoria, { cascade:[Cascade.ALL], nullable: true })
        racing_series?: Rel<Categoria>
}
//FRAN: hay q pasarlas a español
//AGUS: me gustan mas en inglés estas cosas
