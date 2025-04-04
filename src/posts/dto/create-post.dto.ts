import { IsOptional, IsString } from 'class-validator';
import { PostsModel } from '../entities/posts.entity';
import { PickType } from '@nestjs/mapped-types';

// Pick, Omit, Partial -> 타입 반환
// PickType, OmitType, PartialType -> 값을 반환

export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  //   @IsString({
  //     message: 'title은 문자열이어야 합니다.',
  //   }) // body값에 string이지 않으면 에러가 발생
  //   title: string;
  //   @IsString({
  //     message: 'content는 문자열이어야 합니다.',
  //   })
  //   content: string;

  @IsString({
    each: true,
  })
  @IsOptional()
  images: string[] = [];
}
