import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'is_public';

export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true); // true 안 넣어도 됨. 그냥 무언가가 존재한다는 것을 표시하기 위해 넣음

/**
 * 인증이 필요없는 public 라우트를 표시할 때 사용
가드(Guard)에서 이 메타데이터를 확인하여 인증 처리를 스킵할 수 있음
주로 로그인, 회원가입 같은 public 접근이 필요한 엔드포인트에 사용
이 데코레이터는 보통 AuthGuard와 함께 사용되어 인증 로직을 유연하게 제어할 수 있게 해줍니다
 */

/**
 * SetMetadata는 NestJS가 제공하는 헬퍼 함수로, 데코레이터 내부에서 메타데이터를 설정할 때 사용합니다.

이 메타데이터는 주로 가드(Guards) 같은 NestJS 기능에서 사용돼요.

메타데이터를 설정할 때 사용할 키입니다.

문자열 "is_public"는 단순한 식별자예요.

이렇게 상수로 뽑아두면 나중에 Reflector.get() 등으로 메타데이터를 읽을 때 실수를 줄일 수 있어요.

IsPublic()은 커스텀 데코레이터입니다.

이 데코레이터를 어떤 라우터 핸들러나 클래스 위에 붙이면, 해당 대상에 "is_public": true라는 메타데이터가 붙어요.

주로 **AuthGuard(인증 가드)**와 함께 사용합니다.

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const reflector = new Reflector();
    const isPublic = reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
    if (isPublic) {
      return true; // 인증 필요 없이 통과
    }
    return super.canActivate(context); // 기본 인증 로직 수행
  }
}
 */
