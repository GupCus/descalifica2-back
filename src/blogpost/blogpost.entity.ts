import {
  Entity,
  Property,
  ManyToOne,
  Rel,
  Cascade,
  OneToMany,
  PrimaryKey,
} from '@mikro-orm/core';
import { Usuario } from '../usuario/usuario.entity.js';
import { ComentarioPost } from '../comentariopost/comentario.entity.js';

@Entity()
export class Blogpost{
  @PrimaryKey()
  id?: number;
  @Property({ nullable: false })
  title!: string;

  @Property({ nullable: false , type: 'text' })
  content!: string;

  @Property({ nullable: true })
  cover_image?: string;

  @Property({ type: 'json', nullable: true })
  tags?: string[];

  @ManyToOne(() => Usuario, { nullable: false })
  author!: Rel<Usuario>;

  @Property({ nullable: false })
  created_at: Date = new Date();

  @OneToMany(() => ComentarioPost, (comentario) => comentario.blogpost, {
    cascade: [Cascade.ALL],
  })
  comentarios!: Rel<ComentarioPost[]>;
}
