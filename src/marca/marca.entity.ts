import { Entity, Property, OneToMany, Collection, Cascade } from '@mikro-orm/core';
import { baseEntity } from '../shared/baseEntity.entity.js';
import { Escuderia } from '../escuderia/escuderia.entity.js';

@Entity()
export class Marca extends baseEntity {
    
    @Property({ nullable: false })
    nationality!: string;
    
    @Property({ nullable: false })
    foundation!: number;
    
    // Relación inversa con Escuderias
    @OneToMany(() => Escuderia, (escuderia) => escuderia.marca, { cascade: [Cascade.ALL] })
    escuderias = new Collection<Escuderia>(this);
    
    // La propiedad 'name' ya está heredada de baseEntity
    // La propiedad 'id' ya está heredada de baseEntity
}
