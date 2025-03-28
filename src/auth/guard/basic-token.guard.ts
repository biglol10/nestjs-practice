/**
 * 구현할 기능
 *
 * 1) 요청객체 (request)를 불러오고
 *    authorization header로 부터 토큰을 가져온다
 * 2) authService.extractTokenFromHeader을 이용해서
 *    사용할 수 있는 형태의 토큰을 추출한다
 * 3) authService.decodeBasicToken을 실행해서
 *    email과 password를 추출한다
 * 4) email과 password를 이용해서 사용자를 가져온다
 *    authService.authenticateWithEmailAndPassword
 * 5) 찾아낸 사용자를 (1) 요청 객체에 붙여준다
 *    req.user = user;
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable() // 이제 provider임
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {} // Injectable했으니 이렇게 넣어주기만 하면 자동으로 IOC 컨테이너에서 authService를 주입해줌

  // 이 context는 저희가 요청 객체를 가져올 때 쓸 것임
  // false return이면 guard를 통과하지 못하게 할 수 있음
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const rawToken = req.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const { email, password } = this.authService.decodeBasicToken(token);

    const user = await this.authService.authenticateWithEmailAndPassword({
      email,
      password,
    });

    req.user = user;

    return true;
  }
}
