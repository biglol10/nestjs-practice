import {
  BadRequestException,
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
import { UsersModel } from 'src/users/entity/users.entity';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageModelType } from 'src/common/entity/image.entity';
import { DataSource, QueryRunner as QR } from 'typeorm';
import { PostsImagesService } from './image/images.service';
import { LogInterceptor } from 'src/common/interceptor/log.interceptor';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { HttpExceptionFilter } from 'src/common/exception-filter/http.exception-filter';
import { UseFilters } from '@nestjs/common';
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { Roles } from 'src/users/decorator/roles.decorator';
import { RolesEnum } from 'src/users/const/roles.const';
import { IsPostMineOrAdminGuard } from './guard/is-post-mine-or-admin.guard';

@Controller('posts')
export class PostsController {
  // NestJS ioc 컨테이너에서 자동으로 생성이 되고 있습니다 저희가 실행을 하면은 자동으로 ioc 컨테이너가 이 주입되어야 되는 이 서비스들을 생성을 해주는 거에요
  // 그러면 이 서비스를 우리가 어디에다 등록을 하면은 IoC 컨테이너가 인지를 할 수 있냐?
  // 이거는 우리가 posts.module.ts 를 가면 됩니다
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    private readonly postsImagesService: PostsImagesService,
  ) {}

  @Get()
  @IsPublic()
  @UseInterceptors(LogInterceptor)
  // @UseFilters(HttpExceptionFilter)
  getPosts(@Query() query: PaginatePostDto) {
    // throw new BadRequestException('test');

    // return this.postsService.getAllPosts();
    return this.postsService.paginatePosts(query);
  }

  @Get(':id')
  @IsPublic()
  @UseInterceptors(LogInterceptor)
  getPost(@Param('id', ParseIntPipe) id: number) {
    // (ParseIntPipe) Pipe. Controller 진입 전 사전에 검증
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  // @UseInterceptors(FileInterceptor('image')) // 실제 파일을 업로드할 필드 입력 'image'. postmodule에다가 등록을 해놓은 것들이 다 확인이 된 다음에 컨트롤러에서 받게될 것임
  async postPosts(
    // @User() user: UsersModel,
    @User('id') userId: number, // User()로 전체를 가져오지말고
    @Body() body: CreatePostDto,
    // @UploadedFile() file?: Express.Multer.File,
    @QueryRunner() qr: QR,
  ) {
    // await this.postsService.createPostImage(body);

    // return this.postsService.createPost(userId, body, file?.filename); // 이렇게 파일 업로드 하는건 약간 고전적인 방식

    // 로직 실행
    const post = await this.postsService.createPost(userId, body, qr);

    for (let i = 0; i < body.images.length; i++) {
      await this.postsImagesService.createPostImage(
        {
          path: body.images[i],
          post,
          order: i,
          type: ImageModelType.POST_IMAGE,
        },
        qr,
      );
    }

    return this.postsService.getPostById(post.id, qr); // 트랜잭션이 커밋되기 전에 우리가 최신 값을 가져오지 못할 수 있음. 그래서 getPostById에서 qr값을 받도록 함
  }

  @Patch(':postId')
  @UseGuards(IsPostMineOrAdminGuard)
  patchPost(@Param('postId') id: string, @Body() body: UpdatePostDto) {
    return this.postsService.updatePost(parseInt(id), body);
  }

  @Delete(':id')
  // @UseGuards(AccessTokenGuard)
  @Roles(RolesEnum.ADMIN) // 이 라우트는 ADMIN 사용자만 사용할 수 있도록 제한
  deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(parseInt(id));
  }

  @Post('random')
  // @UseGuards(AccessTokenGuard)
  async postPostsRandom(@User('id') user: UsersModel) {
    await this.postsService.generatePosts(user.id);
    return true;
  }
}
