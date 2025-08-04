import { Entity, ManyToOne, Property, Rel } from '@mikro-orm/core';
import { baseEntity } from '../shared/baseEntity.entity.js';
// import { Circuito } from '../circuito/circuito.entity.js';
//import { Temporada } from '../temporada/temporada.entity.js';

@Entity()
export class Carrera extends baseEntity {
    
    @Property({ nullable: false })
    start_date!: Date;
    
    @Property({ nullable: false })
    end_date!: Date;
    
    @Property({ nullable: false })
    temporada!: string; // Campo temporada como string mientras no existe la entidad Temporada
    
    // @ManyToOne(() => Circuito, { nullable: false })
    // Circuito!: Rel<Circuito>;
    
    //DESCOMENTAR CUANDO SE MERGEE TEMPORADA - Cambiar string por relación
    // @ManyToOne(() => Temporada, { nullable: false })
    // temporada!: Rel<Temporada>;
}
