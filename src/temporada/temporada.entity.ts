import { baseEntity } from "../shared/baseEntity.entity.js";
import { Categoria } from "../categoria/categoria.entity.js";
import { Entity, ManyToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";


@Entity()
export class Temporada{
    @PrimaryKey()
    id?: number
    
    @Property({nullable: false})
    year!: number

    /* DESCOMENTAR CUANDO ESTÉ HECHA LA CRUD CARRERA
    @OneToMany(()=> Carrera, carrera => carrera.season) cambiar "season" al nombre que le pongan en la CRUD carrera
    races = new Collection<Carrera>(this)
    */

    @ManyToOne(() => Categoria) //UTILIZO REL "Cannot access 'Categoria' before initialization" at ".../temporada.entity.js"
    racing_series!: Rel<Categoria>

    @Property({nullable: true})
    winner_driver?: string

    @Property({nullable: true})
    winner_team?: string
}