import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from './users.service';
import { Argon2idModule } from 'src/argon2id/argon2id.module';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from 'src/jwt/jwt.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [AuthModule, JwtModule, LoggerModule, PrismaModule, Argon2idModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
