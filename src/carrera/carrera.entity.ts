import {
  Entity,
  ManyToOne,
  Property,
  Rel,
  Collection,
  OneToMany,
  Cascade,
} from '@mikro-orm/core';
import { baseEntity } from '../shared/baseEntity.entity.js';
import { Circuito } from '../circuito/circuito.entity.js';
import { Temporada } from '../temporada/temporada.entity.js';
import { Sesion } from '../sesion/sesion.entity.js';

@Entity()
export class Carrera extends baseEntity {
  @Property({ nullable: false })
  start_date!: Date;

  @Property({ nullable: false })
  end_date!: Date;

  @ManyToOne(() => Circuito, { nullable: false })
  Circuito!: Rel<Circuito>;

  @ManyToOne(() => Temporada, { nullable: false })
  temporada!: Rel<Temporada>;

  // Colección de sesiones - con CASCADE para eliminar sesiones si se elimina la carrera
  @OneToMany(() => Sesion, (sesion) => sesion.carrera, {
    cascade: [Cascade.ALL], // Elimina, actualiza y persiste sesiones automáticamente
    orphanRemoval: true,    // Elimina sesiones huérfanas (sin carrera asignada)
  })
  sesiones = new Collection<Sesion>(this);
}
