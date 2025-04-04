/**
 * post를 find할 때 기본으로 항상 넣을 값들을 여기에다가 정리
 */

import { FindManyOptions } from 'typeorm';
import { PostsModel } from '../entities/posts.entity';

export const DEFAULT_POST_FIND_OPTIONS: FindManyOptions<PostsModel> = {
  relations: {
    author: true,
    images: true,
  },
};
