import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OauthService } from './oauth.service.js';
import { OauthController } from './oauth.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    {
      provide: OauthService,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new OauthService({
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
        });
      },
    },
  ],
  controllers: [OauthController],
})
export class OauthModule {}
