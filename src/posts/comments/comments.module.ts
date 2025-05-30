import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PostsModule } from '../posts.module';
import { CommonModule } from 'src/common/common.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { CommentsModel } from './entity/comments.entity';
import { UsersModule } from 'src/users/users.module';
import { PostExistsMiddelware } from './middleware/post-exists.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentsModel]), // repository 사용이 가능해짐
    CommonModule,
    AuthModule,
    UsersModule,
    PostsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PostExistsMiddelware).forRoutes(CommentsController); // for route말고 적용하고 싶은 컨트롤러를 통째로 넣을 수 있음
  }
}
