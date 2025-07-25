import { Collection, Entity, ManyToMany, OneToMany, PrimaryKey, Property, Cascade } from "@mikro-orm/core";
import { Escuderia } from "../escuderia/escuderia.entity.js";
import { BaseEntity } from "../../shared/db/baseEntity.js";




@Entity()
export class Categoria extends BaseEntity{
    @Property()
    name!: string

    @OneToMany(() => Escuderia, escuderia => escuderia.categoria)
    escuderias = new Collection<Escuderia>(this);
}

