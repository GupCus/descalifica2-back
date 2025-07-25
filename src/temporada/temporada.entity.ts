import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { BaseEntity } from "../../shared/db/baseEntity.js";
import { Piloto } from "../piloto/piloto.entity.js";
import { Escuderia } from "../escuderia/escuderia.entity.js";


Entity()
export class Temporada extends BaseEntity{
    @Property()
    year!: number //VER SI SE PUEDE CAMBIAR A AÑO

    @ManyToOne(() => Piloto, )
    winner_driver?: Piloto

    @ManyToOne(() => Escuderia, )
    winner_team?: Escuderia

    /*
    @OneToMany(() => Carrera, carrera => carrera.temporada, {cascade: [Cascade.ALL]})
    carreras= new Collection<Carrera>(this)
    */
}