/** Core */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/** Caching */
import { GlobalCacheModule } from './cache/cache.module';

/** Logger */
import { LoggerModule } from './logger/logger.module';

/** My Modules */
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { Argon2idModule } from './argon2id/argon2id.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './jwt/jwt.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GlobalCacheModule,
    PrismaModule,
    Argon2idModule,
    AuthModule,
    JwtModule,
    UsersModule,
  ],
})
export class AppModule {}
