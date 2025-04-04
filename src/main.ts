import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/exception-filter/http.exception-filter';

// https://github.com/codefactory-co/nestjs-lv1

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // AppModule로부터 확장해 나가고 이 안에 있는 파일과 폴더들을 관리하면 되겠구나라고 알 수 있음
  // AppModule로부터 모듈들을 하나씩 봐가면서 provider와 컨트롤러를 등록하면 된다는 것을 프레임워크가 알게됨

  // 이 앱에 전반적으로 적용할 파이프를 등록. ValidationPipe를 통해 @IsString 어노테이션들이 따로 컨트롤러에다가
  // validation 적용하거나 모듈에다가 validation module을 추가하지 않아도 앱 전반적으로 우리가 validation을 사용할 수 있게 됨
  // class validator를 사용했을 때 이 validator들이 실행되도록 해주는 pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // order__createdAt?: 'ASC' = 'ASC'; 처럼 기본값 세팅이 필요할 때 써야함. 안 그럼 안됨 (변환을 해도된다). default값을 넣은 채로 인스턴스를 생성해도 괜찮다라고 허가
      transformOptions: {
        /**
         * 임의로 변환하는걸 허락한다.
         * class-validator을 기반으로 isNumber라고 되어있으면 이게 숫자로 변환이 되어야지 정상이구나라는걸 자동으로 인지하고 validation annotation을 통과시킴
         * Type(() => Number)을 생략해도 됨
         */
        enableImplicitConversion: true,
      },
      whitelist: true, // validator가 현재 validation decorator가 적용되지 않은 모든 프로퍼티들을 삭제할 것이다. PaginatePostDto에서 정의한 것들만 받기
      forbidNonWhitelisted: true, // 허용되지 않은 프로퍼티가 있으면 에러 발생 (PaginatePostDto에서 where__title__i_like 외 다른 프로퍼티가 있으면 에러 발생)
    }),
  );

  // app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
