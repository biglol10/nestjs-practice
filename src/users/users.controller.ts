import {
  Controller,
  Post,
  Body,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('userscontroller')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // @UseInterceptors(ClassSerializerInterceptor) // 자동으로 원하는 프로퍼티들을 제외시킬 수 있음. 데이터의 포멧을 변경할 수 있다
  /**
   * serialization -> 직렬화 -> 현재 시스템에서 사용되는 (NestJS) 데이터의 구조를 다른 시스템에서도 쉽게
   *                            사용할 수 있는 포멧으로 변환
   *                            -> class의 object에서 JSON포멧으로 변환
   * deserialization -> 역직렬화 -> 다른 시스템에서 사용되는 포멧을 현재 시스템에서 사용할 수 있는 데이터 구조로 변환
   */
  getUsers() {
    // @Exclude 덕분에 json형태로 변환될 때 제외되는 프로퍼티들이 있음
    return this.usersService.getAllUsers();
  }

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
