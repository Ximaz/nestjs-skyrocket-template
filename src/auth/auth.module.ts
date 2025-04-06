import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Argon2idModule } from 'src/argon2id/argon2id.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoggerModule } from 'src/logger/logger.module';
import { JwtModule } from 'src/jwt/jwt.module';

@Module({
  imports: [Argon2idModule, PrismaModule, LoggerModule, JwtModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
