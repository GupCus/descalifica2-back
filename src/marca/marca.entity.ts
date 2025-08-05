import { Entity, Property } from '@mikro-orm/core';
import { baseEntity } from '../shared/baseEntity.entity.js';

@Entity()
export class Marca extends baseEntity {
    
    @Property({ nullable: false })
    nationality!: string;
    
    @Property({ nullable: false })
    foundation!: number;
    
    // La propiedad 'name' ya está heredada de baseEntity
    // La propiedad 'id' ya está heredada de baseEntity
}
