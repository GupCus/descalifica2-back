import { Categoria } from '../categoria/categoria.entity.js';
import { Piloto } from '../piloto/piloto.entity.js';
import { baseEntity } from '../shared/baseEntity.entity.js';
import { Cascade, Collection, Entity, OneToMany, Property, ManyToOne } from '@mikro-orm/core';
@Entity()
export class Escuderia extends baseEntity{
    //id y name se heredan de la baseEntity
    @Property({nullable: false})
    fundation_year!: number

    @Property()
    nationality!: string

    @Property()
    engine!: string

    @OneToMany(() => Piloto, piloto => piloto.escuderia, {cascade: [Cascade.ALL]})
    pilotos = new Collection<Piloto>(this)

    @ManyToOne(() => Categoria, {cascade: [Cascade.ALL]})
    categoria!: Categoria

    /*
    @ManyToOne(() => Marca, {cascade: [Cascade.ALL]})
    marca?: Marca
    */
}