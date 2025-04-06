import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Argon2idService } from 'src/argon2id/argon2id.service';
import { PrismaService } from 'src/prisma/prisma.service';
import LoginDto from './dto/login.dto';
import RegisterDto from './dto/register.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { User } from '@prisma/client';
import LoggerService from 'src/logger/logger.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly argon2idService: Argon2idService,
    private readonly prismaService: PrismaService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDto.email },
      select: { hashedPassword: true },
    });

    // We are doing fake computation for timing-based attack, so the attacker
    // does not which one is bad between the email or the password. Or both ?
    if (null === user) {
      const fakePasswordHash = await this.argon2idService.hashPassword(
        'this-is-a-fake-password',
      );

      // This should always be false, and if it is not, for instance, if the
      // attacker is trying the specific 'this-is-a-fake-password' password, we
      // just do not care about it, and throw the error anyway.
      await this.argon2idService.verifyPassword(
        fakePasswordHash,
        loginDto.password,
      );

      throw new UnauthorizedException('Invalid credentials.');
    }

    const passwordsMatch = await this.argon2idService.verifyPassword(
      user.hashedPassword,
      loginDto.password,
    );
    if (!passwordsMatch)
      throw new UnauthorizedException('Invalid credentials.');

    // TODO: create a secured JWT.
    return { status: 'ok' };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await this.argon2idService.hashPassword(
      registerDto.password,
    );

    let user: Pick<User, 'id'>;
    try {
      user = await this.prismaService.user.create({
        data: {
          firstname: registerDto.firstname,
          lastname: registerDto.lastname,
          email: registerDto.email,
          hashedPassword: hashedPassword,
        },
        select: { id: true },
      });
    } catch (e: unknown) {
      if (e instanceof PrismaClientKnownRequestError && 'P2002' === e.code)
        throw new ConflictException('Email already taken.');
      throw e;
    }

    // TODO: create a secured JWT.
    return { status: 'ok' };
  }
}
