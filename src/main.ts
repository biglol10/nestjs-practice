import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // AppModule로부터 확장해 나가고 이 안에 있는 파일과 폴더들을 관리하면 되겠구나라고 알 수 있음
  // AppModule로부터 모듈들을 하나씩 봐가면서 provider와 컨트롤러를 등록하면 된다는 것을 프레임워크가 알게됨
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
