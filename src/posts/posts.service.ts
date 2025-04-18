import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsOrder,
  FindOptionsWhere,
  LessThan,
  MoreThan,
  QueryRunner,
  Repository,
} from 'typeorm';
import { PostsModel } from './entity/posts.entity';
import { UsersService } from 'src/users/users.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { CommonService } from 'src/common/common.service';
import { ConfigService } from '@nestjs/config';
import {
  ENV_HOST_KEY,
  ENV_PROTOCOL_KEY,
} from 'src/common/const/env-keys.const';
import { basename, join } from 'path';
import {
  POST_IMAGE_PATH,
  PUBLIC_FOLDER_PATH,
  TEMP_FOLDER_PATH,
} from 'src/common/const/path.const';
import { promises } from 'fs';
import { CreatePostImageDto } from './image/dto/create-image.dto';
import { ImageModel } from 'src/common/entity/image.entity';
import { DEFAULT_POST_FIND_OPTIONS } from './const/default-post-find-options.const';

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
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {} // 그런데 이게 저희가 TypeORM으로부터 를 보여주기 위해서 annotation 하나 더 추가했어요. injectRepository 라는 Decorator 에다가 역시나 post 모델을 저희가 주입할 거라고 이렇게 입력을 해주면 됩니다.

  async getAllPosts() {
    // 컨트롤러에서 바로 반환하기 때문에 async 안해도 되지만 혹시 모르니
    return this.postsRepository.find({
      relations: ['author'],
    }); // 모든 repository의 함수는 async이다
  }

  async paginatePosts(query: PaginatePostDto) {
    // if (query.page) {
    //   return this.pagePaginatePosts(query);
    // }

    // return this.cursorPaginatePosts(query);

    return this.commonService.paginate(
      query,
      this.postsRepository,
      {
        ...DEFAULT_POST_FIND_OPTIONS,
      },
      'posts',
    );
  }

  async pagePaginatePosts(query: PaginatePostDto) {
    /**
     * data: Data[],
     * total: number
     * next: ??
     */
    const { page = 1, take = 20, order__createdAt = 'ASC' } = query;

    const [posts, total] = await this.postsRepository.findAndCount({
      ...DEFAULT_POST_FIND_OPTIONS,
      skip: (page - 1) * take,
      take,
      order: {
        createdAt: order__createdAt,
      },
    });

    const lastPage = Math.ceil(total / take);

    const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
    const host = this.configService.get<string>(ENV_HOST_KEY);

    const next =
      page < lastPage ? `${protocol}://${host}/posts?page=${page + 1}` : null;

    return {
      data: posts,
      total,
      next, // 굳이 필요없음
    };
  }

  // 이걸 더 많이 사용함. infinite scroll에 유용, 데이터가 사라질 때, 추가됐을 때
  async cursorPaginatePosts(query: PaginatePostDto) {
    const {
      where__id__more_than,
      where__id__less_than,
      order__createdAt,
      take,
    } = query;

    const where: FindOptionsWhere<PostsModel> = {};

    if (where__id__more_than) {
      where.id = MoreThan(where__id__more_than ?? 0);
    }

    if (where__id__less_than) {
      where.id = LessThan(where__id__less_than ?? 0);
    }

    const order: FindOptionsOrder<PostsModel> = {};

    order.createdAt = order__createdAt;

    const posts = await this.postsRepository.find({
      where,
      order,
      take,
    });

    /**
     * Response
     *
     * data: Data[],
     * cursor: {
     *   afther: 마지막 Data ID
     *
     * },
     * count: 응답한 데이터의 개수
     * next: 다음 요청을 할 때 사용할 URL
     */

    const lastItem =
      posts.length > 0 && posts.length === query.take
        ? posts[posts.length - 1]
        : null;
    const protocol = this.configService.get<string>(ENV_PROTOCOL_KEY);
    const host = this.configService.get<string>(ENV_HOST_KEY);
    const nextUrl = lastItem && new URL(`${protocol}://${host}/posts`);
    if (nextUrl) {
      /**
       * dto의 키값들을 루핑하면서
       * 키값에 해당되는 벨류가 존재하면
       * param에 그대로 붙여넣는다
       *
       * 단, where__id_more_than값만 lastItem의 마지막 값으로 넣어준다
       */
      for (const key of Object.keys(query)) {
        if (query[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl.searchParams.append(key, query[key]);
          }
        }
      }

      let key = '';

      if (query.order__createdAt === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data: posts,
      count: posts.length,
      cursor: {
        after: lastItem?.id ?? null, // 그냥 명시적으로 하기 위해
      },
      next: nextUrl?.toString() ?? null,
    };
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `임의로 생성된 포스트 제목 ${i}`,
        content: `임의로 생성된 포스트 내용 ${i}`,
        images: [],
      });
    }
  }

  async getPostById(id: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const post = await repository.findOne({
      ...DEFAULT_POST_FIND_OPTIONS,
      where: {
        id,
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  // findAll(): Post[] {
  //   return this.posts;
  // }

  // findOne(id: number): Post {
  //   const post = this.posts.find((post) => post.id === id);
  //   if (!post) {
  //     throw new NotFoundException(`Post with ID ${id} not found`);
  //   }
  //   return post;
  // }

  // async createPostImage(dto: CreatePostDto) {
  //   // dto의 이미지 이름을 기반으로
  //   // 파일의 경로를 생성한다
  //   const tempFilePath = join(TEMP_FOLDER_PATH, dto.image ?? '');

  //   try {
  //     // 파일이 존재하는지 확인
  //     // 만약에 존재하지 않는다면 에러를 던짐
  //     await promises.access(tempFilePath);
  //   } catch (e) {
  //     throw new BadRequestException('존재하지 않는 파일입니다');
  //   }

  //   // 파일의 이름만 가져오기
  //   // /Users/aaa/bbb/asdf.jpg => asdf.jpg
  //   const fileName = basename(tempFilePath);

  //   // 새로 이동할 포스트 폴더의 경로 + 이미지 이름
  //   // (프로젝트 절대경로)/public/posts/asdf.jpg
  //   const newPath = join(POST_IMAGE_PATH, fileName);

  //   // 파일 옮기기
  //   await promises.rename(tempFilePath, newPath);

  //   return true;
  // }

  // async createPostImage(dto: CreatePostImageDto) {
  //   // dto의 이미지 이름을 기반으로
  //   // 파일의 경로를 생성한다
  //   const tempFilePath = join(TEMP_FOLDER_PATH, dto.path);

  //   try {
  //     // 파일이 존재하는지 확인
  //     // 만약에 존재하지 않는다면 에러를 던짐
  //     await promises.access(tempFilePath);
  //   } catch (e) {
  //     throw new BadRequestException('존재하지 않는 파일입니다');
  //   }

  //   // 파일의 이름만 가져오기
  //   // /Users/aaa/bbb/asdf.jpg => asdf.jpg
  //   const fileName = basename(tempFilePath);

  //   // 새로 이동할 포스트 폴더의 경로 + 이미지 이름
  //   // (프로젝트 절대경로)/public/posts/asdf.jpg
  //   const newPath = join(POST_IMAGE_PATH, fileName);

  //   // save
  //   const result = await this.imageRepository.save({
  //     ...dto,
  //   }); // create하고 save해도 되고 그냥 save해도 됨

  //   // 파일 옮기기
  //   await promises.rename(tempFilePath, newPath);

  //   return result;
  // }

  getRepository(qr?: QueryRunner) {
    // PostsModel에 대한 repository를 가져오겠다
    return qr
      ? qr.manager.getRepository<PostsModel>(PostsModel) // qr에 묶여있는 repository를 사용할 수 있음
      : this.postsRepository;
  }

  async createPost(authorId: number, postDto: CreatePostDto, qr?: QueryRunner) {
    // 1) create -> 저장할 객체를 생성한다
    // 2) save -> 객체를 저장한다. (create 메서드에서 생성한 객체로)
    const repository = this.getRepository(qr);

    const post = repository.create({
      author: { id: authorId }, // author 객체에 id만 전달
      ...postDto,
      // image,
      images: [],
      likeCount: 0,
      commentCount: 0,
    });

    const newPost = await repository.save(post);
    return newPost;
  }

  async updatePost(postId: number, postDto: UpdatePostDto) {
    const { title, content } = postDto;
    // save의 기능
    // 1) 만약에 데이터가 존재하지 않는다면 (id 기준으로) 새로 생성한다.
    // 2) 만약에 데이터가 존재한다면 (같은 id의 값이 존재한다면) 존재하던 값을 업데이트한다.

    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    if (title) {
      post.title = title;
    }

    if (content) {
      post.content = content;
    }

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async deletePost(postId: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
      relations: {
        images: true, // 이미지 관계 로드
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    // 연관된 이미지들 먼저 삭제
    if (post.images) {
      // repository.manager는 EntityManager의 인스턴스로,
      // 모든 엔티티에 대한 데이터베이스 작업을 수행할 수 있는 범용 메서드를 제공합니다.
      // 여기서는 post.images 배열에 있는 모든 이미지 엔티티들을 한번에 삭제하는데 사용됩니다.
      await this.postsRepository.manager.remove(post.images);

      // repository.manager를 사용하는 방식
      // 1. EntityManager를 통해 모든 엔티티에 대한 작업 가능
      // 2. 여러 엔티티에 대한 일괄 작업에 유용
      // 3. 트랜잭션 관리가 자동으로 됨
      // 4. 예: await this.postsRepository.manager.remove(post.images);

      // repository를 직접 사용하는 방식
      // 1. 특정 엔티티에 대한 작업만 가능
      // 2. 단일 엔티티 작업에 더 직관적
      // 3. 명시적인 CRUD 작업에 적합
      // 4. 예: await this.postsRepository.delete(postId);
    }

    // 포스트 삭제
    await this.postsRepository.delete(postId);

    return postId;
  }

  async checkPostExistsById(id: number) {
    return this.postsRepository.exist({
      where: {
        id,
      },
    });
  }

  async isPostMine(userId: number, postId: number) {
    return this.postsRepository.exists({
      where: {
        id: postId,
        author: {
          id: userId,
        },
      },
      relations: {
        // relation query를 하려면 relations에서 author:true로 해야함
        author: true,
      },
    });
  }

  async incrementCommentCount(postId: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    await repository.increment(
      {
        id: postId,
      },
      'commentCount',
      1,
    );
  }

  async decrementCommentCount(postId: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    await repository.decrement(
      {
        id: postId,
      },
      'commentCount',
      1,
    );
  }
}
