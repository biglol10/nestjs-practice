import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModel } from './entity/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersModel])], // repository 등록
  controllers: [UsersController],
  providers: [UsersService], // provider는 해당 모듈 안에서만 사용 가능
  exports: [UsersService], // 다른 모듈에서 사용 가능
})
export class UsersModule {}
