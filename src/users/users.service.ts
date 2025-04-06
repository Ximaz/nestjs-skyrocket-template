import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import UpdateUserDto from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Argon2idService } from 'src/argon2id/argon2id.service';
import { AuthenticatedRequest, Page } from 'typings';
import { UserIndex, UserRetrieve } from './entities/user.entity';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly argon2idService: Argon2idService,
    private readonly authService: AuthService,
  ) {}

  async retrieve(
    id: User['id'],
    req: AuthenticatedRequest,
  ): Promise<UserRetrieve> {
    const isMyself = req.user.userId === id;

    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: { id: true, firstname: true, lastname: true, email: isMyself },
    });

    if (null === user) throw new NotFoundException('User not found.');

    return user;
  }

  index({ pageNumber, pageSize }: Page): Promise<UserIndex[]> {
    return this.prismaService.user.findMany({
      skip: pageNumber * pageSize,
      take: pageSize,
      select: {
        id: true,
        firstname: true,
        lastname: true,
      },
    });
  }

  async update(
    id: User['id'],
    updateUserDto: UpdateUserDto,
    req: AuthenticatedRequest,
  ) {
    if (id !== req.user.userId)
      throw new ForbiddenException('Unallowed to modify this user.');

    const payload: Partial<User> = {};

    if (undefined !== updateUserDto.email) {
      const isEmailAlreadyTaken =
        null !==
        (await this.prismaService.user.findUnique({
          where: { email: updateUserDto.email },
        }));

      if (isEmailAlreadyTaken)
        throw new ConflictException('Email already taken.');

      payload.email = updateUserDto.email;
    }

    if (undefined !== updateUserDto.password) {
      const hashedPassword = await this.argon2idService.hashPassword(
        updateUserDto.password,
      );

      payload.hashedPassword = hashedPassword;
    }

    if (undefined !== updateUserDto.firstname)
      payload.firstname = updateUserDto.firstname;

    if (undefined !== updateUserDto.lastname)
      payload.lastname = updateUserDto.lastname;

    await this.prismaService.user.update({
      where: { id },
      data: payload,
    });
  }

  async delete(id: User['id'], req: AuthenticatedRequest): Promise<void> {
    if (id !== req.user.userId)
      throw new ForbiddenException('Unallowed to delete this user.');

    await this.authService.logout(req);

    await this.prismaService.user.delete({
      where: { id },
    });
  }
}
