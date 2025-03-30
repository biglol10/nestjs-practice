import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TagModel } from './tag.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import { IsString } from 'class-validator';
import { StringValidationMessage } from 'src/common/validation-message/string-validation.message';
@Entity()
export class PostsModel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UsersModel, (user) => user.posts) // @JoinColumn이 없어도 되는 이유는 무조건 ManyToOne입장에서 아이디를 들고있게됨
  author: UsersModel;

  @Column()
  @IsString({
    message: StringValidationMessage,
  })
  title: string;

  @Column()
  @IsString({
    message: StringValidationMessage,
  })
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// @Entity()
// export class PostsModel {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @ManyToOne(() => UserModel, (user) => user.posts) // @JoinColumn이 없어도 되는 이유는 무조건 ManyToOne입장에서 아이디를 들고있게됨
//   author: UserModel;

//   @Column()
//   title: string;

//   @ManyToMany(() => TagModel, (tag) => tag.posts)
//   @JoinTable() // many to many에서는 한곳에 jointable을 해줘야함. 중간 테이블을 만들어줌
//   tags: TagModel[];
// }
