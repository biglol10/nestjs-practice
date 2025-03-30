import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsNotEmpty,
  IsIn,
} from 'class-validator';

export class PaginatePostDto {
  @IsNumber()
  page?: number;

  // 이전 마지막 데이터의 ID
  // 이 ID보다 높은 ID부터 값을 가져오기
  //   @Type(() => Number) // query값은 다 string이기에 숫자로 변환해줘야함. "where__id_more_than must be a number conforming to the specified constraints" fix
  @IsNumber()
  @IsOptional()
  where__id_more_than?: number;

  @IsNumber()
  @IsOptional()
  where__id_less_than?: number;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__createdAt?: 'ASC' | 'DESC' = 'ASC';

  // 몇개의 데이터를 응답으로 받을지
  @IsNumber()
  @IsOptional()
  take?: number = 20;
}
