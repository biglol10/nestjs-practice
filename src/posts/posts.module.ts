import { BadRequestException, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import { POST_IMAGE_PATH } from 'src/common/const/path.const';
import { v4 as uuid } from 'uuid'; // uuid는 여러 버전이 있는데 일반적으로 가장 많이 쓰는게 4번 버전

// PostModule이 Module이다라는 정의
@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel]),
    AuthModule,
    UsersModule,
    CommonModule,
    // MulterModule.register({
    //   limits: {
    //     fileSize: 10000000, // 바이트 단위로 입력
    //   },
    //   fileFilter: (req, file, cb) => {
    //     /**
    //      * cb(에러, boolean)
    //      *
    //      * 첫번째 파라미터에는 에러가 있을 경우 에러 정보를 넣어준다
    //      * 두번째 파라미터는 파일을 받을지 말지 boolean을 넣어준다
    //      */
    //     const ext = extname(file.originalname);

    //     if (ext !== '.jpg' && ext !== '.jpeg' && ext !== 'png') {
    //       return cb(
    //         new BadRequestException('jpg/jpeg/png 파일만 업로드 가능합니다'),
    //         false,
    //       );
    //     }

    //     return cb(null, true);
    //   },
    //   storage: multer.diskStorage({
    //     destination: function (req, res, cb) {
    //       cb(null, POST_IMAGE_PATH);
    //     }, // 파일을 다운로드 햇을 때 어디로 파일을 보낼건지 입력 가능
    //     filename: function (req, file, cb) {
    //       cb(null, `${uuid()}${extname(file.originalname)}`);
    //     },
    //   }),
    // }),
  ], // TypeORM 모델과 연동이 되는 레포지토리를 사용을 하려면은 저희가 레포지토리 모듈을 import를 해줘야 돼요. for root 는 어디다 쓰냐면 우리가 type orm 에 연결 설정을 할 때 쓰고요. forFeature 같은 경우에는 저희가 모델에 해당되는 레포지토리를 주입할 때 쓰게 됩니다. 저희가 불러오고 싶은 모델들을 전부 다 넣어주면 돼요. 예를 들어서 우리가 PostModel과 관련된 레포지토리를 사용하고 싶다고 하면은 이 list에다가 PostModel 이라고 이렇게 넣어주면 됩니다
  controllers: [PostsController], // PostController를 사용하기 때문에 포스트 컨트롤러를 등록을 하게 됩니다. 클래스를 그대로 넣음 (PostController() - instance가 아니라). 이 클래스를 인스턴스화하고 싶은 게 아니고 IoC 컨테이너가 자동으로 인스턴스화하고 관리하는 거를 원함
  providers: [PostsService], // 포스트 컨트롤러에서 이렇게 주입을 하는 값들을 전부 다 저희가 이 providers 안에다 넣어줌. 서비스가 꼭 아니더라도 저희가 특정 클래스에 컨트롤러에서 이렇게 주입을 클래스들은 전부 다 Providers 안에다가 넣어주면 됩니다

  // 그러면은 이 모듈 안에 등록되어 있는 컨트롤러와 providers 안에서는 저희가 이 providers 안에 등록된 모든 클래스들을 인스턴스화 없이 IoC 컨테이너에 의존하면서 사용을 할 수가 있게 돼요

  // NestJS가 실행이 됐을 때 PostController가 실행이 돼야 되는데 인스턴스화가 돼가지고 이 함수들을 실행할 수 있는 준비가 돼 있어야 되는데 이 포스트 컨트롤러가 잘 실행되기 위해서는 이 PostService에 대한 의존성이 있죠 그죠? 자 이 의존성을 IoC 컨테이너가 생성을 해서 포스트 컨트롤러 안에다 주입을 해준다는 거죠
  // 아시겠죠? 그리고 그렇게 주입이 되려면은 우리가 모듈에다가 provider로 등록을 해줘야된다

  // 결과적으로 어떤 얘기를 하느냐 모듈 안에다가 우리가 프로바이더 안에 저희가 사용할 수가 있는데 그거 외에도 저희가 실제로 Provider에다가 Injectable이라고 이렇게 태그를 해줘야지만 프로바이더로 사용할 수 있다는 결론을 내릴 수가 있습니다

  // module에다가 등록 + Injectable()등록
})
export class PostsModule {}
