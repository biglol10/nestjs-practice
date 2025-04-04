import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException) // NestJS에서 기본으로 제공해주는 모든 exception들은 HttpException을 상속받음
// 그럼 이 class를 적용했을 때 http exception에 해당하는 모든 exception을 잡을 수 있음
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // @Catch(HttpException)와 같아야 함
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const message = exception.getResponse();

    /**
     * 앱 전체에서
     * 로그 파일을 생성하거나
     * 에러 모니터링 시스템에 API콜하기를 원한다면
     * main.ts에서 app.useGlobalFilters(new HttpExceptionFilter()); 이 코드를 추가해야 함
     */

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toLocaleString('kr'),
      path: request.url,
    });
  }
}
