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

/**
 * NestJS의 실행 순서: Middleware -> Guard -> Interceptor(before) -> Pipe -> Controller -> Service -> Interceptor(after) -> Filter -> Client
 *
 * 1. Middleware
 * - 라우트 핸들러 전에 호출되는 함수
 * - 요청과 응답 객체에 접근 가능
 * - next() 함수를 통해 다음 미들웨어로 제어 전달
 * - 주로 사용: 인증, 로깅, 요청 파싱 등
 * - 예: cors(), helmet(), express.json()
 *
 * 2. Guard
 * - 특정 라우트에 대한 접근 허용 여부를 결정
 * - 주로 인증/인가에 사용
 * - true/false를 반환하여 요청 진행 여부 결정
 * - 예: @AuthGuard(), RolesGuard
 *
 * 3. Interceptor
 * - 요청과 응답을 가로채서 변형 가능
 * - 요청 전후에 추가 로직 실행 가능
 * - 함수 실행 시간 측정, 캐싱, 응답 매핑 등에 사용
 * - RxJS Observable 기반으로 동작
 * - 예: CacheInterceptor, TimeoutInterceptor
 *
 * 4. Pipe
 * - 입력 데이터 변환 및 유효성 검사
 * - 주로 @Body, @Param, @Query 등의 데이터 처리
 * - 데이터 타입 변환, 유효성 검증에 사용
 * - 예: ValidationPipe, ParseIntPipe
 *
 * 사용 시기:
 * - 전역적인 인증/로깅 -> Middleware
 * - 특정 라우트 접근 제어 -> Guard
 * - 요청/응답 데이터 변형, 캐싱 -> Interceptor
 * - 입력 데이터 검증/변환 -> Pipe
 */
