import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorator/roles.decorator';
import { RolesEnum } from '../const/roles.const';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    /**
     * Roles annotation에 대한 metadata를 가져와야한다.
     *
     * Reflector -> NestJS의 IOC 컨테이너에서 자동으로 우리가 주입받을 수 있음. getAllAndOverride가 있음
     * getAllAndOverride() -> Roles annotation에 대한 키값. 이 키값을 통해서 메타데이터를 가져올 수 있음.
     * 그 중에서 가장 가까운 annotation을 가져와서 값들을 오버라이드 해줌
     * 예를 들어 @Roles(RolesEnum.ADMIN)을 delete api에 넣고 controller class엔 @Roles(RolesEnum.USER)를 넣으면
     * @Roles(RolesEnum.ADMIN)이 우선권을 가지게 됨. (method에 등록되어 있는 annotation)
     * 즉, 관련있는 annotation을 다 가져오돼. 그 중에서 가장 가까운 annotation을 가져오고 그 값을 오버라이드 해줌
     */

    const requiredRoles = this.reflector.getAllAndOverride<RolesEnum>(
      ROLES_KEY, // 이 키 값을 기준으로 메타데이터를 가져옴
      [context.getHandler(), context.getClass()], // 이 메타데이터를 가져오는 대상은 메서드와 클래스
    );

    if (!requiredRoles) {
      // Roles annotation이 등록 안되어있음
      // 이 부분이 작성된 이유는 NestJS 앱 전체에다 등록하기 위해 그런거임
      return true;
    }

    // 이 가드가 실행되기 전에 무조건 AccessTokenGuard가 실행되어야함
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException('토큰을 제공해주세요');
    }

    if (user.role !== requiredRoles) {
      throw new ForbiddenException(
        `이 작업을 수행할 권한이 없습니다. ${requiredRoles} 권한이 필요합니다`,
      );
    }

    return true;
  }
}
