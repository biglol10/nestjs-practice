import { BadRequestException, Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentsModel } from './entity/comments.entity';
import { QueryRunner, Repository } from 'typeorm';
import { UsersModel } from 'src/users/entity/users.entity';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { DEFAULT_COMMENT_FIND_OPTIONS } from './const/default-comment-fine-options.const';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { UpdateCommentsDto } from './dto/update-comments.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<CommentsModel>(CommentsModel)
      : this.commentsRepository;
  }

  paginteComments(dto: PaginateCommentsDto, postId: number) {
    return this.commonService.paginate(
      dto,
      this.commentsRepository,
      {
        ...DEFAULT_COMMENT_FIND_OPTIONS,
        where: {
          post: {
            id: postId,
          },
        },
      },
      `posts/${postId}/comments`,
    );
  }

  async getCommentById(id: number) {
    const comment = await this.commentsRepository.findOne({
      ...DEFAULT_COMMENT_FIND_OPTIONS,
      where: {
        id,
      },
    });

    if (!comment) {
      throw new BadRequestException(`id: ${id} Comment는 존재하지 않습니다.`);
    }

    return comment;
  }

  async createComment(
    dto: CreateCommentsDto,
    postId: number,
    author: UsersModel,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return repository.save({
      ...dto,
      post: {
        id: postId,
      },
      author,
    });
  }

  async updateComment(dto: UpdateCommentsDto, commentId: number) {
    const comment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new BadRequestException('존재하지 않는 댓글입니다.');
    }

    // preload는 엔티티의 일부 속성만 업데이트할 때 사용됩니다.
    // 1. id로 기존 엔티티를 찾습니다.
    // 2. 찾은 엔티티에 새로운 속성값들을 덮어씌웁니다.
    // 3. 만약 엔티티가 없다면 undefined를 반환합니다.
    const prevComment = await this.commentsRepository.preload({
      id: commentId,
      ...dto,
    });

    if (!prevComment) {
      throw new BadRequestException('Comment not found');
    }

    const newComment = await this.commentsRepository.save(prevComment);

    return newComment;
  }

  async deleteComment(id: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);

    const comment = await repository.findOne({
      where: {
        id,
      },
    });

    if (!comment) {
      throw new BadRequestException('존재하지 않는 댓글입니다.');
    }

    await repository.delete(id);

    return id;
  }

  async isCommentMine(userId: number, commentId: number) {
    return this.commentsRepository.exist({
      where: {
        id: commentId,
        author: {
          id: userId,
        },
      },
      relations: {
        author: true,
      },
    });
  }
}
