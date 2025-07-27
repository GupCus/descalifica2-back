import { Collection, Entity, ManyToMany, OneToMany, PrimaryKey, Property, Cascade } from "@mikro-orm/core";
import { Escuderia } from "../escuderia/escuderia.entity.js";
import { baseEntity } from "../shared/baseEntity.entity.js";




@Entity()
export class Categoria extends baseEntity{
    @Property()
    name!: string

    @OneToMany(() => Escuderia, escuderia => escuderia.categoria)
    escuderias = new Collection<Escuderia>(this);
}

