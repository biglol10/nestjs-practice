import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel) // UsersService에서 inject를 해줘야 함
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async createUser(nickname: string, email: string, password: string) {
    const user = this.usersRepository.create({
      nickname,
      email,
      password,
    });

    return this.usersRepository.save(user);
  }

  async getUserByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
    });
  }
}
