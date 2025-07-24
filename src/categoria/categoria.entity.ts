import { Collection, Entity, ManyToMany, OneToMany, PrimaryKey, Property, Cascade } from "@mikro-orm/core";
import { Escuderia } from "../escuderia/escuderia.entity.js";




@Entity()
export class Categoria{
    @PrimaryKey()
    id?: number
    @Property()
    name!: string
    @OneToMany(() => Escuderia, escuderia => escuderia.categoria)
    escuderias = new Collection<Escuderia>(this);

}