import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// 앱 컨트롤러가 이렇게 생성이 된 이유는 베이스가 되는 가장 루트에 있는 값이 존재해야 하니까 하나 자동으로 만들어 놓은 거구요
// @Controller('post')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() // / 안 넣어도 됨
  getHello(): any {
    return {
      id: 1,
      title: 'Sample Post',
      content: 'This is a sample post content',
      author: 'John Doe',
      createdAt: '2024-01-01T00:00:00Z',
    };
  }
}
