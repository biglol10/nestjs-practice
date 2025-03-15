import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { ProfileModel } from './profile.entity';
import { PostsModel } from './posts.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity()
export class UserModel {
  @PrimaryGeneratedColumn() // 'uuid'도 가능함
  // @PrimaryColumn은 내가 직접 넣어줘야 함
  id: number;

  @Column({
    // 데이터베이스에서 인지하는 칼럼 타입
    // 자동으로 츄우됨
    type: 'varchar',
    // 데이터베이스 칼럼 이름
    // 프로퍼티 이름으로 자동 유추됨
    name: 'title',
    length: 300,
    nullable: true,
    // true면 처음 저장할 때만 값 저장 가능
    // 이후에는 값 변경 불가능
    update: false,
    // find()를 실행할 때 기본으로 값을 불러올지
    // 기본값이 true. false면 find했을 때 값이 없음. 보고싶으면 find({select: {title: true}})
    select: true,
    default: 'default title',
    unique: false,
  })
  title: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  // 데이터가 생성되는 날짜와 시간이 자동으로 찍힘
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn() // 데이터가 수정될 때마다 버전이 증가함 (1씩. 처음 생성되면 1, save() 함수가 몇번 불렀는지 기억한다)
  version: number;

  @Column()
  @Generated('increment') // 'uuid'도 가능함
  additionalId: number;

  @OneToOne(() => ProfileModel, (profile) => profile.user, {
    // find() 실행 할 때마다 항상 같이 가져올 relation
    eager: true,
    cascade: true, // 영속성 컨텍스트에서 관리하는 데이터가 변경되면 관련된 데이터도 함께 변경됨. 저장 시 relation도 같이 저장할 수 있게 (한번에)
    nullable: false,
    onDelete: 'CASCADE', // 삭제 시 관련된 데이터도 함께 삭제
  })
  profile: ProfileModel;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
