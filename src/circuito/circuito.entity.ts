import crypto from "node:crypto";
import { Entity, Property } from "@mikro-orm/core";
import { baseEntity } from "../shared/baseEntity.entity.js";

@Entity()
export class Circuito extends baseEntity {
  @Property({ nullable: true })
  country?: string;

  @Property({ nullable: true })
  length?: string;

  @Property({ nullable: true })
  year?: number;

  @Property({ nullable: true })
  track_map_image?: string;

  @Property({ nullable: true })
  photo_image?: string;
}
