import {
  Entity,
  Property,
  ManyToMany,
  Collection,
  Cascade,
  ManyToOne,
  Rel,
} from "@mikro-orm/core";
import { baseEntity } from "../shared/baseEntity.entity.js";

@Entity()
export class Usuario extends baseEntity {
  @Property({ nullable: false, unique: true })
  username!: string;
  @Property({ nullable: false })
  password!: string;
  @Property({ nullable: false })
  name!: string;
  @Property({ nullable: false })
  surname!: string;
  @Property({ nullable: false, unique: true })
  email!: string;
  @Property({ nullable: false })
  date_of_birth!: Date;
  @Property({ nullable: true })
  fav_driver!: string;
  @Property({ nullable: true })
  fav_team!: string;
  @Property({ nullable: true })
  fav_circuit!: string;
  @Property({ nullable: true })
  bio!: string;
}
