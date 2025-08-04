import { Entity, Property } from "@mikro-orm/core";
import { baseEntity } from '../shared/baseEntity.entity.js';

@Entity()
export class CircuitoClass extends baseEntity {
  @Property({ nullable: false, unique: true })
  name!: string;

  @Property()
  description!: string;
}
