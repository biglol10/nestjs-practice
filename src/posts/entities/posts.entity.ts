import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserModel } from './user.entity';
import { TagModel } from './tag.entity';

// @Entity()
// export class PostsModel {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   author: string;

//   @Column()
//   title: string;

//   @Column()
//   content: string;

//   @Column()
//   likeCount: number;

//   @Column()
//   commentCount: number;
// }

@Entity()
export class PostsModel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserModel, (user) => user.posts) // @JoinColumn이 없어도 되는 이유는 무조건 ManyToOne입장에서 아이디를 들고있게됨
  author: UserModel;

  @Column()
  title: string;

  @ManyToMany(() => TagModel, (tag) => tag.posts)
  @JoinTable() // many to many에서는 한곳에 jointable을 해줘야함. 중간 테이블을 만들어줌
  tags: TagModel[];
}
