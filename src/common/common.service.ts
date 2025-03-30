import { BadRequestException, Injectable } from '@nestjs/common';
import { BasePaginationDto } from './dto/base-pagination.dto';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  MoreThan,
  Repository,
} from 'typeorm';
import { BaseModel } from 'src/posts/entities/inheritance.entity';
import { HOST, PROTOCOL } from './const/env.const';
import { FILTER_MAPPER } from './const/filter-mapper.const';

@Injectable()
export class CommonService {
  async paginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    if (dto.page) {
      return this.pagePaginate(dto, repository, overrideFindOptions);
    }

    return this.cursorPaginate(dto, repository, overrideFindOptions, path);

    const { page = 1, take = 20, order__createdAt = 'ASC' } = dto;

    const [data, total] = await repository.findAndCount({
      ...overrideFindOptions,
      skip: (page - 1) * take,
      take,
      order: {
        createdAt: order__createdAt,
      } as FindOptionsOrder<T>,
    });

    const lastPage = Math.ceil(total / take);

    const next =
      page < lastPage ? `${PROTOCOL}://${HOST}/${path}?page=${page + 1}` : null;

    return {
      data,
      total,
      next,
    };
  }

  private async pagePaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {
    const findOptions = this.composeFindOptions<T>(dto);

    const [data, count] = await repository.findAndCount({
      ...findOptions,
      ...overrideFindOptions,
    });

    return {
      data,
      total: count,
    };
  }

  private async cursorPaginate<T extends BaseModel>(
    dto: BasePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    /**
     * where__likcCount__more_than (특정 제목을 통해 where 조건 세팅, split로)
     * where__title__ilike (특정 제목을 통해 where 조건 세팅)
     */
    const findOptions = this.composeFindOptions<T>(dto);

    const results = await repository.find({
      ...findOptions,
      ...overrideFindOptions,
    });

    const lastItem =
      results.length > 0 && results.length === dto.take
        ? results[results.length - 1]
        : null;

    const protocol = PROTOCOL;
    const host = HOST;

    const nextUrl = lastItem && new URL(`${protocol}://${host}/${path}`);

    if (nextUrl) {
      /**
       * dto의 키값들을 루핑하면서
       * 키값에 해당되는 벨류가 존재하면
       * param에 그대로 붙여넣는다.
       *
       * 단, where__id_more_than 값만 lastItem의 마지막 값으로 넣어준다.
       */

      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }

      let key = '';

      if (dto.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data: results,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: results.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private composeFindOptions<T extends BaseModel>(
    dto: BasePaginationDto,
  ): FindManyOptions<T> {
    /**
     * where,
     * order,
     * take,
     * skip -> page 기반일 때만
     */
    /**
     * DTO의 현재 생긴 구조는 아래와 같다
     *
     * {
     *   where__id__more_than: 1,
     *   order__createdAt: 'ASC',
     * }
     *
     * 이지만 모든 where 필터들을 자동으로 파싱할 수 있을만한 기능이 제작되어야 한다
     *
     * 1) where로 시작한다면 필터 로직을 적용한다
     * 2) order로 시작한다면 정렬 로직을 적용한다
     * 3) 필터 로직을 적용한다면 '__' 기준으로 split했을 때 3개의 값으로 나뉘는지 2개의 값으로 나뉘는지 확인한다
     *    3-1) 3개의 값으로 나뉜다면 FILTER_MAPPER에서 해당되는 operator 함수를 찾아서 적용한다
     *         ['where', 'id', 'more_than'] -> id 필드에 대해서 more_than 연산자를 적용한다
     *    3-2) 2개의 값으로 나뉜다면 정확한 값을 필터하는 것이기 때문에 operator 없이 적용한다
     *         ['where', 'id'] -> id 필드에 대해서 정확한 값을 필터한다
     * 4) order의 경우 3-2와 같이 적용한다
     */

    let where: FindOptionsWhere<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      // key -> where__id__less_than
      // value -> 1

      if (key.startsWith('where__')) {
        where = {
          ...where,
          ...this.parseWhereFilter(key, value),
        };
      } else if (key.startsWith('order__')) {
        order = {
          ...order,
          ...this.parseWhereFilter(key, value),
        };
      }
    }

    return {
      where,
      order,
      take: dto.take,
      skip: dto.page ? (dto.take ?? 20) * (dto.page - 1) : undefined,
    };
  }

  private parseWhereFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<T> | FindOptionsOrder<T> {
    const options: FindOptionsWhere<T> = {};

    /**
     * 예를들어 where__id__more_than
     * __를 기준으로 나눴을때
     *
     * ['where', 'id', 'more_than']으로 나눌 수 있다.
     */

    const split = key.split('__');

    if (split.length !== 2 && split.length !== 3) {
      throw new BadRequestException(
        `where 필터는 '__'로 split 했을때 길이가 2 또는 3이어야합니다 - 문제되는 키값 : ${key}`,
      );
    }

    /**
     * 길이가 2일경우는
     * where__id = 3
     *
     * FindOptionsWhere로 풀어보면
     * 아래와 같다
     *
     * {
     *  where:{
     *      id: 3,
     *  }
     * }
     */
    if (split.length === 2) {
      // ['where', 'id']
      const [_, field] = split;

      /**
       * field -> 'id'
       * value -> 3
       *
       * {
       *      id: 3,
       * }
       */

      options[field] = value;
    } else {
      /**
       * 길이가 3일 경우에는 Typeorm 유틸리티 적용이 필요한 경우다.
       *
       * where__id__more_than의 경우
       * where는 버려도 되고 두번째 값은 필터할 키값이 되고
       * 세번째 값은 typeorm 유틸리티가 된다.
       *
       * FILTER_MAPPER에 미리 정의해둔 값들로
       * field 값에 FILTER_MAPPER에서 해당되는 utility를 가져온 후
       * 값에 적용 해준다.
       */

      // ['where', 'id', 'more_than']
      const [_, field, operator] = split;

      // where__id__between = 3,4
      // 만약에 split 대상 문자가 존재하지 않으면 길이가 무조건 1이다.
      // const values = value.toString().split(',')

      // field -> id
      // operator -> more_than
      // FILTER_MAPPER[operator] -> MoreThan
      // if(operator === 'between'){
      //     options[field] = FILTER_MAPPER[operator](values[0], values[1]);
      // }else{
      //     options[field] = FILTER_MAPPER[operator](value);
      // }

      if (operator === 'i_like') {
        options[field] = FILTER_MAPPER[operator](`%${value}%`);
      } else {
        options[field] = FILTER_MAPPER[operator](value);
      }
    }

    return options;
  }
}
