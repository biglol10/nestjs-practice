import { PickType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';
import { ImageModel } from 'src/common/entity/image.entity';

export class CreatePostImageDto extends PickType(ImageModel, [
  'path',
  'post',
  'order',
  'type',
]) {}
