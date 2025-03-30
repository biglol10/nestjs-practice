import { IsString } from 'class-validator';

import { IsNotEmpty } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { UsersModel } from 'src/users/entities/users.entity';

export class RegisterUserDto extends PickType(UsersModel, [
  'nickname',
  'email',
  'password',
]) {}
