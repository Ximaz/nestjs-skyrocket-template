import { Test, TestingModule } from '@nestjs/testing';
import { OauthService } from './oauth.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '../jwt/jwt.service.js';
import { LoggerService } from '../logger/logger.service.js';
import { mockDeep } from 'jest-mock-extended';

describe('OauthService', () => {
  let service: OauthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: OauthService,
          useValue: new OauthService(
            {
              google: {
                CLIENT_ID: 'GOOGLE_CLIENT_ID',
                CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET',
                AUTHORIZATION_URL:
                  'https://accounts.google.com/o/oauth2/v2/auth',
                REDIRECT_URI: 'OAUTH_CALLBACK_ENDPOINT' + '/google',
                TOKEN_URL: 'https://oauth2.googleapis.com/token',
                REVOKE_URL: 'https://oauth2.googleapis.com/revoke',
                OPENID_URL: 'https://openidconnect.googleapis.com/v1/userinfo',
              },
            },
            mockDeep<UsersService>(),
            mockDeep<JwtService>(),
            mockDeep<LoggerService>(),
          ),
        },
      ],
    }).compile();

    service = module.get<OauthService>(OauthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
