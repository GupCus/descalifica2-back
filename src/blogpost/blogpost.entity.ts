import {
  Entity,
  Property,
  ManyToOne,
  Rel,
  Cascade,
  OneToMany,
} from '@mikro-orm/core';
import { baseEntity } from '../shared/baseEntity.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { ComentarioPost } from '../comentariopost/comentario.entity.js';

@Entity()
export class Blogpost extends baseEntity {
  @Property({ nullable: false })
  title!: string;

  @Property({ nullable: false , type: 'text' })
  content!: string;

  @Property({ nullable: true })
  cover_image?: string;

  @ManyToOne(() => Usuario, { nullable: false })
  author!: Rel<Usuario>;

  @Property({ nullable: false })
  created_at: Date = new Date();

  @OneToMany(() => ComentarioPost, (comentario) => comentario.blogpost, {
    cascade: [Cascade.ALL],
  })
  comentarios!: Rel<ComentarioPost[]>;
}
