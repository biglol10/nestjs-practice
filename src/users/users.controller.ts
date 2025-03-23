import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('userscontroller')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // async createUser(
  //   @Body() body: { nickname: string; email: string; password: string },
  // ) {
  //   return this.usersService.createUser({
  //     nickname: body.nickname,
  //     email: body.email,
  //     password: body.password,
  //   });
  // }
}
