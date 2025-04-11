import { SetMetadata } from '@nestjs/common';
import { RolesEnum } from '../const/roles.const';

export const ROLES_KEY = 'user_roles'; // 이 키 값을 사용해서 메타데이터를 등록하고 메타데이터를 불러올 수가 있다

// @Roles(RolesEnum.ADMIN) 이라고 입력하면 그 api는 ADMIN사용자가 아니면 사용할 수 없게 만들거임
export const Roles = (role: RolesEnum) => SetMetadata(ROLES_KEY, role);
