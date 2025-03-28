import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersModel } from '../entities/users.entity';
// User 데코레이터는 무조건 엑세스 토큰가드를 사용한 상태에서 사용할 수 있다는 가정하에 설계해봄
export const User = createParamDecorator(
  (data: keyof UsersModel | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    const user = req.user as UsersModel;

    if (!user) {
      throw new InternalServerErrorException(
        'User 데코레이터는 AccessTokenGuard와 함께 사용해야함. Request에 user 프로퍼티가 존재하지 않습니다',
      );
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);
