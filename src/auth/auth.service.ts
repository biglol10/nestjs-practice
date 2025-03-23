/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService, // authModule안에서 jwt module을 임포트 해줬기 때문에 서비스에서 JWTService를 inject받을 수 있음
    private readonly usersService: UsersService,
  ) {}
  /**
   * 토큰을 사용하게 되는 방식
   *
   * 1) 사용자가 로그인 또는 회원가입을 진행하면
   *    accessToken과 refreshToken을 발급받는다
   *
   * 2) 로그인 할 때는 Basic 토큰 함께 요청을 보낸다
   *    Basic 토큰은 '이메일:비밀번호'를 base64로 인코딩 한 형태이다
   *    예: {authorization: 'Basic {token}'}
   *
   * 3) 아무나 접근할 수 없는 정보 {private route}를 접근 할 때는
   *    accessToken을 header에 추가해서 요청과 함께 보낸다
   *    예: {authorization: 'Bearer {token}'}
   *
   * 4) 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보낸 사용자가 누군지 알 수 있다
   *    예를 들어서 현재 로그인한 사용자가 작성한 포스트만 가져오려면 토큰의 sub값에 입력되어있는 사용자의 포스트만 따로 필터링 할 수 있다
   *
   * 5) 모든 토큰은 만료 기간이 있다. 만료기간이 지나면 새로 토큰을 발급받아야 한다
   *    그렇지 않으면 jwtService.verify()에서 인증이 통과 안된다
   *    그러니 access 토큰을 새로 발급받을 수 있는 /auth/token/access 와 refresh 토큰을 새로 받을 수 있는 /auth/token/refresh 라우트를 만들어준다 (아니면 다시 로그인하게 만들 수 있음, 설계에 따라 다름)
   *
   * 6) 토큰이 만료되면 각각의 토큰을 새로 발급 받을 수 있는 엔드포인트에 요청을 해서
   *    새로운 토큰을 발급받고 새로운 토큰을 사용해서 private route에 접근할 수 있다
   */

  /**
   * 우리가 만드려는 기능
   *
   * 1) registerWithEmail
   *  - email, nickname, password를 입력받고 사용자를 생성한다
   *  - 생성이 완료되면 accessToken과 refreshToken을 발급한다
   *    회원가입 후 다시 로그인해주세요 <- 이런 쓸데없는 과정을 방지하기 위해서
   *
   * 2) loginWithEmail
   *  - email, password를 입력받고 사용자를 로그인한다
   *  - 로그인이 완료되면 accessToken과 refreshToken을 발급한다
   *
   * 3) loginUser
   *  - (1)과 (2)에서 필요한 accessToken과 refreshToken을 반환하는 로직
   *
   * 4) signToken
   *  - (3)에서 필요한 accessToken과 refreshToken을 sign하는 로직
   *
   * 5) authenticateWithEmailAndPassword
   *  - (2)에서 로그인을 진행할 때 필요한 기본적인 검증 진행
   *    1. 사용자가 존재하는지 확인 (email)
   *    2. 비밀번호가 맞는지 확인
   *    3. 모두 통과되면 찾은 사용자 정보 반환
   *    4. loginWithEmail에서 반환된 데이터를 기반으로 토큰 생성
   *
   */

  /**
   * 1) email
   * 2) sub -> id
   * 3) type: 'access' | 'refresh'
   *
   * (email: string, id: number)
   */
  signToken(user: Pick<UsersModel, 'id' | 'email'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'id' | 'email'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    /**
     * 사용자가 존재하는지 확인
     * 비밀번호가 맞는지 확인
     * 모두 통과되면 찾은 사용자 정보 반환
     *  */

    const existingUser = await this.usersService.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    /**
     * 입력된 비밀번호
     * 기존 해시 (hash) => 사용자 정보에 저장되어 있는 hash
     */

    const passOk = await bcrypt.compare(user.password, existingUser.password);

    if (passOk !== true) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 일치하지 않습니다.',
      );
    }

    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(existingUser);
  }

  async registerWithEmail(
    user: Pick<UsersModel, 'nickname' | 'email' | 'password'>,
  ) {
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);

    const newUser = await this.usersService.createUser({
      ...user,
      password: hash,
    });

    return this.loginUser(newUser);
  }
}
