import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Post as PostType, PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  // NestJS ioc 컨테이너에서 자동으로 생성이 되고 있습니다 저희가 실행을 하면은 자동으로 ioc 컨테이너가 이 주입되어야 되는 이 서비스들을 생성을 해주는 거에요
  // 그러면 이 서비스를 우리가 어디에다 등록을 하면은 IoC 컨테이너가 인지를 할 수 있냐?
  // 이거는 우리가 posts.module.ts 를 가면 됩니다
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getAllPosts() {
    return this.postsService.findAll();
  }

  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postsService.findOne(parseInt(id));
  }

  @Post()
  createPost(
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.create(author, title, content);
  }

  @Put(':id')
  updatePost(
    @Param('id') id: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return this.postsService.update(parseInt(id), title, content);
  }

  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postsService.delete(parseInt(id));
  }
}
