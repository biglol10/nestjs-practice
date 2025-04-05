import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserModel } from './user.entity';

@Entity()
export class ProfileModel {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => UserModel, (user) => user.profile) // user의 profile과 연결
  @JoinColumn() // 컬럼 이름을 지정해줌. 사용자 모델 테이블에 있는 아이디를 프로파일 모델에서 들고있음
  user: UserModel;

  @Column()
  profileImg: string;
}
