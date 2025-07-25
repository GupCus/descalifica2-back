import { Cascade, Entity, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property} from "@mikro-orm/core"
import { Escuderia } from "../escuderia/escuderia.entity.js"
import { BaseEntity } from "../../shared/db/baseEntity.js"

@Entity()
export class Piloto extends BaseEntity{

    @Property({nullable: false, unique: true}) //no puede ser null, nombre único
    name!: string

    @Property({nullable: false})
    birth_date!: string

    @Property()
    nationality!: string

    @Property()
    description!: string
    
    @Property()
    role?: string

    @ManyToOne(() => Escuderia, { cascade: [Cascade.ALL] })
    actualTeam?: Escuderia
    
}