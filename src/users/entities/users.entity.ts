import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { PostsModel } from 'src/posts/entities/posts.entity';
import {
  IsEmail,
  IsString,
  Length,
  ValidationArguments,
} from 'class-validator';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { StringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { EmailValidationMessage } from 'src/common/validation-message/email-validation.message';
import { Exclude, Expose } from 'class-transformer';

@Entity()
// @Exclude() // 모든 프로퍼티들을 제외시킴, 보이게 하려면 노출하고자 하는 프로퍼티에 @Expose() 추가
export class UsersModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
    unique: true,
  })
  @IsString({
    message: StringValidationMessage,
  })
  // @Length(1, 20, {
  //   message: '닉네임은 1자 이상 20자 이하여야 합니다.',
  // })
  @Length(1, 20, {
    message: lengthValidationMessage,
  })
  nickname: string;

  @Column({
    unique: true,
  })
  @IsString({
    message: StringValidationMessage,
  })
  @IsEmail(
    {},
    {
      message: EmailValidationMessage,
    },
  )
  email: string;

  @Column({
    type: 'enum',
    enum: RolesEnum,
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @Column()
  @IsString({
    message: StringValidationMessage,
  })
  @Length(3, 8)
  /**
   * Request
   * front -> back
   * plain object (JSON) -> class instance (dto)
   *
   * Response
   * back -> front
   * class instance (dto) -> plain object (JSON)
   *
   * toClassOnly -> class instance로 변환될 때만
   * toPlainOnly -> plain object로 변환될 때만
   */
  @Exclude({
    toPlainOnly: true, // 응답이 나가는 상황에만
  })
  password: string;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];

  // @Expose() // 실제 존재하지 않는 프로퍼티를 expose시킬 수 있음
  // get nicknameAndEmail() {
  //   return this.nickname + ' ' + this.email;
  // }
}
