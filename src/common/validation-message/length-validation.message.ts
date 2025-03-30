import { ValidationArguments } from 'class-validator';

export const lengthValidationMessage = (args: ValidationArguments) => {
  /**
   * ValidationArguments의 프로퍼티들
   *
   * 1) value -> 검증되고 있는 값(입력된 값)
   * 2) constraints -> 제약조건에 대한 정보
   */
  if (args.constraints.length === 2) {
    return `${args.value}은 ${args.constraints[0]}자 이상 ${args.constraints[1]}자 이하여야 합니다.`;
  } else {
    return `${args.value}은 ${args.constraints[0]}자 이상이어야 합니다.`;
  }
};
