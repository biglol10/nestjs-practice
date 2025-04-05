import { NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';

// middleware은 module에다가 적용함
export class LogMiddleware implements NestMiddleware {
  use(req: any, res: any, next: NextFunction) {
    console.log(
      `[Middleware] [REQ] ${req.method} ${req.url} ${new Date().toISOString()}`,
    );
    next();
  }
}
