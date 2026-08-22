import {
  Entity,
  Property,
  Collection,
  Cascade,
  ManyToOne,
  OneToMany,
  Rel,
} from '@mikro-orm/core';
import { baseEntity } from '../shared/baseEntity.entity.js';
import { Carrera } from '../carrera/carrera.entity.js';
import { Session_Result } from './session_result.entity.js';

@Entity()
export class Sesion extends baseEntity {
  @Property({ nullable: true })
  type?: string;

  @Property({ nullable: true })
  start_time?: Date;

  @Property({ nullable: true })
  end_time?: Date;

  // Relación con carrera DEBIL
  @ManyToOne(() => Carrera, { nullable: false })
  race!: Rel<Carrera>;

  // Colección de resultados, sesiones - con CASCADE para eliminar sesiones si se elimina la sesión
  @OneToMany(() => Session_Result, (sesion) => sesion.session, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  session_result = new Collection<Session_Result>(this);
}
