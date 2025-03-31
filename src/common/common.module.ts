import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';

@Module({
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService], // 다른 모듈에서 재사용 가능
})
export class CommonModule {}
