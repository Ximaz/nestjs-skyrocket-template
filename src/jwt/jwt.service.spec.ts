import { Test, TestingModule } from '@nestjs/testing';
import { JwtService, JwtServiceKeyPathOptions } from './jwt.service.js';
import { ConfigService } from '@nestjs/config';

const fakeEnv: Record<string, string> = {
  JOSE_ENCYPTION_PUBLIC_KEY_PATH: '/tmp/JOSE_ENCYPTION_PUBLIC_KEY.jwk',
  JOSE_ENCYPTION_PRIVATE_KEY_PATH: '/tmp/JOSE_ENCYPTION_PRIVATE_KEY.jwk',
  JOSE_SIGN_PUBLIC_KEY_PATH: '/tmp/JOSE_SIGN_PUBLIC_KEY.jwk',
  JOSE_SIGN_PRIVATE_KEY_PATH: '/tmp/JOSE_SIGN_PRIVATE_KEY.jwk',
  JWT_AUDIENCE: 'AUDIENCE',
  JWT_ISSUER: 'ISSUER',
};

const mockedConfigService = {
  getOrThrow(key: string) {
    const value = fakeEnv[key];
    if (undefined === value)
      throw new Error(`${key} not found in environment variables.`);
    return value;
  },
};

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: mockedConfigService,
        },
        {
          provide: JwtService,
          inject: [ConfigService],
          async useFactory(configService: ConfigService) {
            const jwtServiceKeyPaths = {
              encryptKeys: {
                publicPath: configService.getOrThrow<string>(
                  'JOSE_ENCYPTION_PUBLIC_KEY_PATH',
                ),
                privatePath: configService.getOrThrow<string>(
                  'JOSE_ENCYPTION_PRIVATE_KEY_PATH',
                ),
              },
              signKeys: {
                publicPath: configService.getOrThrow<string>(
                  'JOSE_SIGN_PUBLIC_KEY_PATH',
                ),
                privatePath: configService.getOrThrow<string>(
                  'JOSE_SIGN_PRIVATE_KEY_PATH',
                ),
              },
            } satisfies JwtServiceKeyPathOptions;

            const jwtServiceKeys = await JwtService.getKeys(jwtServiceKeyPaths);

            return new JwtService({
              ...jwtServiceKeys,
              audience: configService.getOrThrow<string>('JWT_AUDIENCE'),
              issuer: configService.getOrThrow<string>('JWT_ISSUER'),
            });
          },
        },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an encrypted JWT', async () => {
    const jwe = await service.create(
      {
        user: { sub: 'ID' },
      },
      60 * 60,
    );

    const payload = await service.verify(jwe);

    expect(payload.user).toStrictEqual({ sub: 'ID' });
  });

  it('should invalidate the encrypted JWT for timeout reasons', async () => {
    const jwe = await service.create(
      {
        user: { sub: 'ID' },
      },
      0,
    );

    await new Promise((resolve) => setTimeout(resolve, 5));

    await expect(service.verify(jwe)).rejects.toThrow();
  });
});
