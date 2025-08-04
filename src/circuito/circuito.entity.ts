import crypto from 'node:crypto';
import { Piloto } from '../piloto/piloto.entity.js';
import { Escuderia } from '../escuderia/escuderia.entity.js';
import {Entity, Property, OneToMany,ManyToMany,Collection, Cascade,Rel} from '@mikro-orm/core';
import { baseEntity } from '../shared/baseEntity.entity.js';

@Entity()
export class Circuito extends baseEntity {
  @Property({nullable:false}) name!: string;
  @Property({nullable:false}) country!: string;
  @Property({nullable:false}) length!: number;
  @Property({nullable:false}) year!: number;
  
  //@Property() driver: Piloto,
  //@Property() team: Escuderia,

}


