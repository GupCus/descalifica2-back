import crypto from 'node:crypto';
import { Entity, Property } from '@mikro-orm/core';
import { baseEntity } from '../shared/baseEntity.entity.js';

@Entity()
export class Circuito extends baseEntity {
  @Property({ nullable: false }) name!: string;
  @Property({ nullable: false }) country!: string;
  @Property({ nullable: false }) length!: string;
  @Property({ nullable: false }) year!: number;
}
