import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PostsService } from '../posts.service';
import { RolesEnum } from 'src/users/const/roles.const';
import { UsersModel } from 'src/users/entity/users.entity';
import { Request } from 'express';

@Injectable()
export class IsPostMineOrAdminGuard implements CanActivate {
  constructor(private readonly postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const req = context.switchToHttp().getRequest() as Request & {
      user: UsersModel;
    };

    const { user } = req;

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다');
    }

    /**
     * Admin일 경우 그냥 패스
     */

    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const postId = req.params.postId;

    if (!postId) {
      throw new BadRequestException('Post ID가 파라미터로 제공되어야 합니다');
    }

    const isPostMine = await this.postsService.isPostMine(user.id, +postId);

    if (!isPostMine) {
      throw new UnauthorizedException('게시글 작성자만 삭제할 수 있습니다');
    }

    return true;
  }
}
