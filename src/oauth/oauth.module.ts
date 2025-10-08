import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OauthService } from './oauth.service.js';
import { OauthController } from './oauth.controller.js';
import { UsersService } from '../users/users.service.js';
import { UsersModule } from '../users/users.module.js';
import { JwtService } from '../jwt/jwt.service.js';
import { JwtModule } from '../jwt/jwt.module.js';
import { LoggerService } from '../logger/logger.service.js';
import { LoggerModule } from '../logger/logger.module.js';

@Module({
  imports: [ConfigModule, UsersModule, JwtModule, LoggerModule],
  providers: [
    {
      provide: OauthService,
      inject: [ConfigService, UsersService, JwtService, LoggerService],
      useFactory: (
        configService: ConfigService,
        usersService: UsersService,
        jwtService: JwtService,
        loggerService: LoggerService,
      ) => {
        return new OauthService(
          {
            google: {
              CLIENT_ID: configService.getOrThrow('GOOGLE_CLIENT_ID'),
              CLIENT_SECRET: configService.getOrThrow('GOOGLE_CLIENT_SECRET'),
              AUTHORIZATION_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
              REDIRECT_URI:
                configService.getOrThrow('OAUTH_CALLBACK_ENDPOINT') + '/google',
              TOKEN_URL: 'https://oauth2.googleapis.com/token',
              REVOKE_URL: 'https://oauth2.googleapis.com/revoke',
              OPENID_URL: 'https://openidconnect.googleapis.com/v1/userinfo',
            },
          },
          usersService,
          jwtService,
          loggerService,
        );
      },
    },
  ],
  controllers: [OauthController],
})
export class OauthModule {}
