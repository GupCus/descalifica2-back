import { Cascade, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Piloto } from "../piloto/piloto.entity.js";
import { Categoria } from "../categoria/categoria.entity.js";
import { BaseEntity } from "../../shared/db/baseEntity.js";

@Entity()
export class Escuderia extends BaseEntity{
    
    @Property({nullable: false, unique: true})
    name!: string

    @Property({nullable: false})
    fundation_year!: number

    @Property()
    nationality!: string

    @Property()
    engine!: string

    @OneToMany(() => Piloto, piloto => piloto.actualTeam, {cascade: [Cascade.ALL]})
    pilotos = new Collection<Piloto>(this)

    @ManyToOne(() => Categoria, {cascade: [Cascade.ALL]})
    categoria!: Categoria

    /*
    @ManyToOne(() => Marca, {cascade: [Cascade.ALL]})
    marca?: Marca
    */
}