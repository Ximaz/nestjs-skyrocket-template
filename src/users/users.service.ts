import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import UpdateUserDto from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Argon2idService } from 'src/argon2id/argon2id.service';
import { Page } from 'typings';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly argon2idService: Argon2idService,
  ) {}

  async retrieve(id: User['id']) {
    const user = await this.prismaService.user.findUnique({
      where: { id },

      select: { firstname: true, lastname: true },
    });

    if (null === user) throw new NotFoundException('User not found.');

    return user;
  }

  index({ pageNumber, pageSize }: Page) {
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

  async update(id: User['id'], updateUserDto: UpdateUserDto) {
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

  delete(id: User['id']) {
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
