import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const QueryRunner = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.queryRunner) {
      throw new InternalServerErrorException('QueryRunner is not attached');
    }

    return request.queryRunner;
  },
);
