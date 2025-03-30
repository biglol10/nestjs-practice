import { PartialType, PickType } from '@nestjs/mapped-types';
import { PostsModel } from '../entities/posts.entity';
import { CreatePostDto } from './create-post.dto';
import { IsString } from 'class-validator';
import { IsOptional } from 'class-validator';
import { StringValidationMessage } from 'src/common/validation-message/string-validation.message';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsString({
    message: StringValidationMessage,
  })
  @IsOptional()
  title?: string;

  @IsString({
    message: StringValidationMessage,
  })
  @IsOptional()
  content?: string;
}
