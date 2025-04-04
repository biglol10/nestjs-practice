import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Post as PostType, PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { UsersModel } from 'src/users/entities/users.entity';
import { User } from 'src/users/decorator/decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('posts')
export class PostsController {
  // NestJS ioc 컨테이너에서 자동으로 생성이 되고 있습니다 저희가 실행을 하면은 자동으로 ioc 컨테이너가 이 주입되어야 되는 이 서비스들을 생성을 해주는 거에요
  // 그러면 이 서비스를 우리가 어디에다 등록을 하면은 IoC 컨테이너가 인지를 할 수 있냐?
  // 이거는 우리가 posts.module.ts 를 가면 됩니다
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    // return this.postsService.getAllPosts();
    return this.postsService.paginatePosts(query);
  }

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    // (ParseIntPipe) Pipe. Controller 진입 전 사전에 검증
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  // @UseInterceptors(FileInterceptor('image')) // 실제 파일을 업로드할 필드 입력 'image'. postmodule에다가 등록을 해놓은 것들이 다 확인이 된 다음에 컨트롤러에서 받게될 것임
  async postPosts(
    // @User() user: UsersModel,
    @User('id') userId: number, // User()로 전체를 가져오지말고
    @Body() body: CreatePostDto,
    // @UploadedFile() file?: Express.Multer.File,
  ) {
    await this.postsService.createPostImage(body);

    // return this.postsService.createPost(userId, body, file?.filename); // 이렇게 파일 업로드 하는건 약간 고전적인 방식
    return this.postsService.createPost(userId, body); // 이렇게 파일 업로드 하는건 약간 고전적인 방식
  }

  @Patch(':id')
  patchPost(@Param('id') id: string, @Body() body: UpdatePostDto) {
    return this.postsService.update(parseInt(id), body);
  }

  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postsService.delete(parseInt(id));
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostsRandom(@User('id') user: UsersModel) {
    await this.postsService.generatePosts(user.id);
    return true;
  }
}
