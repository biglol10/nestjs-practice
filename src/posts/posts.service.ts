import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

@Injectable() // 주입할 수 있다
export class PostsService {
  constructor(
    // constructor 그 다음에 여기에다가 우리가 post-repository를 주입을 시킴
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>, // 이렇게 해주면 저희가 postModel을 다루는 레포지토리 타입을 저희가 지정을 할 수가 있죠
  ) {} // 그런데 이게 저희가 TypeORM으로부터 를 보여주기 위해서 annotation 하나 더 추가했어요. injectRepository 라는 Decorator 에다가 역시나 post 모델을 저희가 주입할 거라고 이렇게 입력을 해주면 됩니다.

  private posts: Post[] = [
    {
      id: 1,
      title: 'First Post',
      content: 'This is my first post content',
      author: 'John Doe',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      title: 'Second Post',
      content: 'This is my second post content',
      author: 'Jane Smith',
      createdAt: '2024-01-02T00:00:00Z',
    },
    {
      id: 3,
      title: 'Third Post',
      content: 'This is my third post content',
      author: 'Bob Wilson',
      createdAt: '2024-01-03T00:00:00Z',
    },
  ];

  findAll(): Post[] {
    return this.posts;
  }

  findOne(id: number): Post {
    const post = this.posts.find((post) => post.id === id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  create(author: string, title: string, content?: string): Post[] {
    const newPost = {
      id: this.posts.length + 1,
      author,
      title,
      content: content || '',
      createdAt: new Date().toISOString(),
    };

    this.posts.push(newPost);
    return this.posts;
  }

  update(id: number, title: string, content: string): Post {
    const post = this.findOne(id);
    post.title = title;
    post.content = content;
    return post;
  }

  delete(id: number): Post[] {
    const post = this.findOne(id);
    this.posts = this.posts.filter((post) => post.id !== id);
    return this.posts;
  }
}
