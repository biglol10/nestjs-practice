import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './posts/entity/user.entity';
import { Repository } from 'typeorm';
import { ProfileModel } from './posts/entity/profile.entity';
// 앱 컨트롤러가 이렇게 생성이 된 이유는 베이스가 되는 가장 루트에 있는 값이 존재해야 하니까 하나 자동으로 만들어 놓은 거구요
// @Controller('post')
@Controller()
export class AppController {
  // constructor(private readonly appService: AppService) {}

  constructor(
    // 서비스 안 만들고 여기에서 다 구현
    @InjectRepository(UserModel)
    private readonly usersRepository: Repository<UserModel>,
    @InjectRepository(ProfileModel)
    private readonly profileRepository: Repository<ProfileModel>,
  ) {}

  @Get('users')
  getUsers() {
    return this.usersRepository.find({
      relations: ['profile'],
    });

    // relations: {
    //   profile: true
    // }

    this.usersRepository.find({
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          id: true,
        },
      },
      where: [
        {
          id: 3, // MORE, LESSTHAN, LIKE, ILIKE(대소문자구분안함) 등 사용 가능
        }, // 조건 1. 같은 객체 안이면 AND
        {
          version: 1,
        }, // 조건 2
        {
          profile: {
            id: 1,
          },
        },
      ],
      order: {
        id: 'DESC',
      },
      skip: 0, // 처음 몇개를 제외할지
      take: 10, // 몇개를 가져올지
    });
  }

  @Post('users')
  async createUser() {
    return this.usersRepository.save({
      title: 'test title',
    });

    // preload
    // 입력된 값을 기반으로 데이터베이스에 있는 데이터를 불러오고
    // 추가 입력된 값으로 데이터베이스에서 가져온 값들을 대체함
    // 저장하지는 않음
    this.usersRepository.preload({
      id: 1,
      title: 'test title (updated)', // 값만 바꿔서 보여줌
    });

    // increment는 어떤걸 증가시킬지
    await this.usersRepository.increment({ id: 1 }, 'count', 1);

    // decrement는 어떤걸 감소시킬지
    await this.usersRepository.decrement({ id: 1 }, 'count', 1);
  }

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

  @Post('user/profile')
  async createUserAndProfile() {
    const user = await this.usersRepository.save({
      title: 'test title',
    });

    const profile = await this.profileRepository.save({
      profileImg: 'test profileImg',
      user: user,
    });

    return {
      user,
      profile,
    };
  }
}
