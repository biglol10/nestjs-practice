import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HASH_ROUNDS } from 'src/auth/const/auth.const';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel) // UsersService에서 inject를 해줘야 함
    private readonly usersRepository: Repository<UsersModel>,
  ) {}

  async createUser(user: Pick<UsersModel, 'nickname' | 'email' | 'password'>) {
    // 1) nickname 중복 체크
    // exist() -> 만약에 조건에 해당되는 값이 있으면 true 반환
    const nicknameExist = await this.usersRepository.exist({
      where: { nickname: user.nickname },
    });

    if (nicknameExist) {
      throw new BadRequestException('이미 존재하는 닉네임입니다.');
    }

    const emailExist = await this.usersRepository.exist({
      where: { email: user.email },
    });

    if (emailExist) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    const userObject = this.usersRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    return await this.usersRepository.save(userObject);
  }

  async getUserByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async getUserById(id: number) {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  async getAllUsers() {
    /**
     * 비밀번호 같은거 노출시키기 싫으면 class transformer
     * 사용해서 응답 값들을 변환하는 것을 추천
     */
    return this.usersRepository.find();
  }
}
