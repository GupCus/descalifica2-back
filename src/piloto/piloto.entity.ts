import { Cascade, Entity, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property} from "@mikro-orm/core"
import { Escuderia } from "../escuderia/escuderia.entity.js"

@Entity()
export class Piloto {
    @PrimaryKey()
    id?: number

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