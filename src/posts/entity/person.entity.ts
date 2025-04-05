import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Name {
  @Column()
  first: string;

  @Column()
  last: string;
}

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column(() => Name) // 다만 이 방법이 많이 쓰이진 않음. 상속을 통해서 함
  name: Name;

  @Column()
  class: string;
}

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column(() => Name)
  name: Name;

  @Column()
  salary: number;
}
