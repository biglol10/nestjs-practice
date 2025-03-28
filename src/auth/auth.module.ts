import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
@Module({
  imports: [
    JwtModule.register({
      // global: true,
      // secret: 'secret',
      // signOptions: { expiresIn: '60s' },
    }),
    UsersModule, // UsersModule에 있는 모든 provider을 쓸 수 있을 것 같음. 그런데 그 안의 provider들을 쓸 수 없음.
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
