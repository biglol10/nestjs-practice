import {
  ClassSerializerInterceptor,
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts/entity/posts.entity';
import { UserModel } from './posts/entity/user.entity';
import { Student, Teacher } from './posts/entity/person.entity';
import { ProfileModel } from './posts/entity/profile.entity';
import { TagModel } from './posts/entity/tag.entity';
import { UsersModule } from './users/users.module';
import { UsersModel } from './users/entity/users.entity';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import {
  ENV_DB_HOST_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_DATABASE_KEY,
} from './common/const/env-keys.const';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PUBLIC_FOLDER_PATH } from './common/const/path.const';
import { ImageModel } from './common/entity/image.entity';
import { LogMiddleware } from './common/middleware/log.middleware';
import { CommentsModule } from './posts/comments/comments.module';
import { CommentsModel } from './posts/comments/entity/comments.entity';
import { AccessTokenGuard } from './auth/guard/bearer-token.guard';
// module.ts 같은 경우는 우리가 컨트롤러와 서비스를 포함한 다른 프로바이더들을 관리. 의존성들을 관리하게 되는 파일

/**
 * App module이 core module이니 이 모듈을 통해서 다른 모듈들이 실행됨
 * 이 app module에 포함된 모든 다른 모듈에서도 ClassSerializerInterceptor가 적용됨
 */

@Module({
  imports: [
    TypeOrmModule.forFeature([UserModel, ProfileModel]),
    PostsModule,
    ServeStaticModule.forRoot({
      // 4022.jpg
      // http://localhost:3000/public/posts/4022.jpg 이 아니라 http://localhost:3000/posts/4022.jpg 이렇게 요청을 해야되게 됨
      // 그래서 꼭 public 이라는 prefix, 접두어가 붙었으면 좋겠으면 serveRoot넣기. posts/4022.jpg 하면 우리의 post 요청과 중복이 됨
      // 그런데 posts 요청 보면 image uuid 값만 보내고 있는데 public/post라는 prefix가 붙기를 원한다면
      // 엔티티에서 프로퍼티를 변경할 수 있는 기능인 class transformer 쓰면 됨 (@Transform)
      rootPath: PUBLIC_FOLDER_PATH, // 파일들을 서빙할 가장 최상단의 폴더
      serveRoot: '/public',
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true, // appmodule에서만 설정하면 다른 곳에서도 쓸 수 있게 해줌
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env[ENV_DB_HOST_KEY],
      port: parseInt(process.env[ENV_DB_PORT_KEY]!),
      username: process.env[ENV_DB_USERNAME_KEY],
      password: process.env[ENV_DB_PASSWORD_KEY],
      database: process.env[ENV_DB_DATABASE_KEY],
      entities: [
        PostsModel,
        UserModel,
        Student,
        Teacher,
        ProfileModel,
        TagModel,
        UsersModel,
        ImageModel, // 안하면 @OneToMany((type) => ImageModel, (image) => image.post) 에서 에러
        CommentsModel,
      ], // UserModel을 entities 배열에 추가
      synchronize: true, // nestjs에서 작성하는 typeorm코드와 데이터베이스의 동기화를 자동으로 맞춤
    }),
    UsersModule,
    AuthModule,
    CommonModule,
    CommentsModule,
  ], // 다른 모듈을 불러올 때 사용. cli를 이용했으니 자동으로 생성됨
  controllers: [AppController],
  providers: [
    AppService,
    {
      // 개별 컨트롤러에 @UseInterceptors(ClassSerializerInterceptor) 넣지않고 여기에 공통으로 적용
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD, // 모든 요청에 적용되는 가드
      useClass: AccessTokenGuard, // AccessTokenGuard를 전역 가드로 설정
      // 모든 엔드포인트에서 Bearer 토큰 검증
      // @IsPublic() 데코레이터가 있는 라우트는 검증 제외
    },
  ],
})

// middleware은 로깅이나 보안적인 요소들 Cors라던가 helmet같은 것 적용할 때 사용
// 이걸 다 통과해야 pipeline interceptor 넘어갈 수 있도록 함
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes({
      path: 'posts', // posts에 해당되는 모든 path들을 적용할 것이다. 모든 요층은 path: '*'
      method: RequestMethod.ALL, // 모든 메서드에 적용할 것이다
    }); // 적용할 미들웨어 등록. 적용할 라우트 등록해줘야 함
    consumer.apply(LogMiddleware).forRoutes({
      path: 'posts/*',
      method: RequestMethod.ALL,
    });
  }
}
