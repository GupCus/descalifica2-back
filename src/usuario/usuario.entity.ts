import {
  BeforeCreate,
  Collection,
  Entity,
  OneToMany,
  Property,
} from "@mikro-orm/core";
import { baseEntity } from "../shared/baseEntity.entity.js";
import { Blogpost } from "../blogpost/blogpost.entity.js";
import bcrypt from "bcrypt";

@Entity()
export class Usuario extends baseEntity {
  @Property({ nullable: true, unique: true })
  username?: string;
  @Property({ nullable: false })
  password!: string;
  @Property({ nullable: false })
  user_type!: string;
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

  @BeforeCreate()
  async hash_password_create() {
    if (this.password) {
      const salt = 12;
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async compare_password(password_plana: string) {
    return await bcrypt.compare(password_plana, this.password);
  }
}
