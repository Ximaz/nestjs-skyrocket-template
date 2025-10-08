import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './logger/logger.module.js';
// import { GlobalCacheModule } from './cache/cache.module.js';
import { OauthModule } from './oauth/oauth.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtModule } from './jwt/jwt.module.js';

@Module({
  imports: [
    LoggerModule,
    ConfigModule,
    // GlobalCacheModule,
    JwtModule,
    AuthModule,
    UsersModule,
    OauthModule,
  ],
})
export class AppModule {}
