import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './logger/logger.module.js';
// import { GlobalCacheModule } from './cache/cache.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { JwtModule } from './jwt/jwt.module.js';
import { OauthModule } from './oauth/oauth.module.js';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    // GlobalCacheModule,
    PrismaModule,
    JwtModule,
    OauthModule,
  ],
})
export class AppModule {}
