import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { UsersService } from 'src/users/users.service';

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
    private readonly usersService: UsersService,
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

  async getAllPosts() {
    // 컨트롤러에서 바로 반환하기 때문에 async 안해도 되지만 혹시 모르니
    return this.postsRepository.find({
      relations: ['author'],
    }); // 모든 repository의 함수는 async이다
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

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

  async createPost(authorId: number, title: string, content: string) {
    const post = this.postsRepository.create({
      author: { id: authorId }, // author 객체에 id만 전달
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    });

    const newPost = await this.postsRepository.save(post);
    return newPost;
  }

  async update(id: number, title: string, content: string) {
    // 1) 만약에 데이터가 존재하지 않는다면 (id를 기준으로) 새로 생성한다
    // 2) 만약에 데이터가 존재한다면 그 데이터를 업데이트 한다

    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (title) {
      post.title = title;
    }

    // if (content) {
    //   post.content = content;
    // }

    const updatedPost = await this.postsRepository.save(post);
    return updatedPost;
  }

  delete(id: number): Post[] {
    const post = this.findOne(id);
    this.posts = this.posts.filter((post) => post.id !== id);
    return this.posts;
  }
}
