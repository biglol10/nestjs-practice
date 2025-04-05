import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'is_public';

export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * 인증이 필요없는 public 라우트를 표시할 때 사용
가드(Guard)에서 이 메타데이터를 확인하여 인증 처리를 스킵할 수 있음
주로 로그인, 회원가입 같은 public 접근이 필요한 엔드포인트에 사용
이 데코레이터는 보통 AuthGuard와 함께 사용되어 인증 로직을 유연하게 제어할 수 있게 해줍니다
 */
