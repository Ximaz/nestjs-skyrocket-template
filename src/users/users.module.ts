import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from './users.service';
import { Argon2idModule } from 'src/argon2id/argon2id.module';

@Module({
  imports: [PrismaModule, Argon2idModule],
  providers: [UsersService],
})
export class UsersModule {}
