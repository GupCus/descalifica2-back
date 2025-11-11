import { Collection, Entity, OneToMany, Property } from "@mikro-orm/core";
import { baseEntity } from "../shared/baseEntity.entity.js";
import { Blogpost } from "../blogpost/blogpost.entity.js";

@Entity()
export class Usuario extends baseEntity {
  @Property({ nullable: true, unique: true })
  username?: string;
  @Property({ nullable: false })
  password_hash!: string;
  @Property({ nullable: true })
  surname?: string;
  @Property({ nullable: false, unique: true })
  email!: string;
  @Property({ nullable: true })
  date_of_birth?: Date;
  @Property({ nullable: true })
  fav_driver?: string;
  @Property({ nullable: true })
  fav_team?: string;
  @Property({ nullable: true })
  fav_circuit?: string;
  @Property({ nullable: true })
  bio?: string;
  @OneToMany(() => Blogpost, (blogpost) => blogpost.author)
  posts = new Collection<Blogpost>(this);
}
