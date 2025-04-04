import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    /**
     * 요청이 들어올때 REQ 요청이 들어온 타임스탬프를 찍는다.
     * [REQ] {요청 path} {요청 시간}
     *
     * 요청이 끝날때 (응답이 나갈때) 다시 타임스탬프를 찍는다.
     * [RES] {요청 path} {응답 시간} {얼마나 걸렸는지 ms}
     */

    const now = new Date();

    const req = context.switchToHttp().getRequest();

    // /posts
    // /common/image
    const path = req.originalUrl;

    // [REQ] {요청 path} {요청 시간}
    console.log(`[REQ] ${path} ${now.toLocaleString('kr')}`);

    // return next.handle()을 실행하는 순간
    // 라우트의 로직이 전부 실행되고 응답이 반환된다.
    // observable로 (observable은 rxjs에서 제공하는 타입으로 일종의 스트림)
    // next.handle을 실행해서 응답을 받으면 그 응답값이 pipe를 통해서 각각의 함수를 전부 다 실행함
    // tap 여러개 생성 가능. 파이프 함수에서 tap함수를 지나갈 때마다 전달되는 값들을 (observable) 그대로 우리가 모니터링할 수 있음 (변형은 못함)
    // 변형하고 싶으면 map 써야함
    return next.handle().pipe(
      tap(
        // [RES] {요청 path} {응답 시간} {얼마나 걸렸는지 ms}
        (observable) =>
          console.log(
            `[RES] ${path} ${new Date().toLocaleString('kr')} ${new Date().getMilliseconds() - now.getMilliseconds()}ms`,
          ),
      ),
      map((observable) => {
        // 변형하고 싶으면 map 써야함
        return observable;

        return {
          message: '성공성공',
          response: observable,
        };
      }),
    );
  }
}
