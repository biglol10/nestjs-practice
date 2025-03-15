import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { PostsModel } from './posts.entity';

@Entity()
export class TagModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => PostsModel, (post) => post.tags)
  posts: PostsModel[];
}
