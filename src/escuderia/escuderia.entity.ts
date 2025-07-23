import { Piloto } from '../piloto/piloto.entity.js';
import { baseEntity } from '../shared/baseEntity.entity.js';
import { Cascade, Collection, Entity, OneToMany, Property } from '@mikro-orm/core';

@Entity()
export class Escuderia extends baseEntity{
    @OneToMany(() => Piloto, (piloto) => piloto.team, { cascade: [Cascade.ALL] })
    pilotos = new Collection<Piloto>(this);
    @Property({nullable:false}) 
    fundation!:number
    @Property({nullable:false})
    nationality!:string
    @Property({nullable:false})
    engine!:string
}

//AGUS: ¿¿¿QUE HAY DE IMPORTANTE COMO PARA PONER???