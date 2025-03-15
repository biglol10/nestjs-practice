import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts/entities/posts.entity';
import { UserModel } from './posts/entities/user.entity';
import { Student, Teacher } from './posts/entities/person.entity';
import { ProfileModel } from './posts/entities/profile.entity';
import { TagModel } from './posts/entities/tag.entity';
import { UsersModule } from './users/users.module';
import { UsersModel } from './users/entities/users.entity';
// module.ts 같은 경우는 우리가 컨트롤러와 서비스를 포함한 다른 프로바이더들을 관리. 의존성들을 관리하게 되는 파일
@Module({
  imports: [
    TypeOrmModule.forFeature([UserModel, ProfileModel]),
    PostsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [
        PostsModel,
        UserModel,
        Student,
        Teacher,
        ProfileModel,
        TagModel,
        UsersModel,
      ], // UserModel을 entities 배열에 추가
      synchronize: true, // nestjs에서 작성하는 typeorm코드와 데이터베이스의 동기화를 자동으로 맞춤
    }),
    UsersModule,
  ], // 다른 모듈을 불러올 때 사용. cli를 이용했으니 자동으로 생성됨
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
