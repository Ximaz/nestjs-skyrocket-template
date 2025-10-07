import { Test, TestingModule } from '@nestjs/testing';
import { JwtService, JwtServiceKeyPathOptions } from './jwt.service.js';

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: JwtService,
          useFactory: async () => {
            const config = {
              encryptKeys: {
                publicPath: '/tmp/JOSE_ENCYPTION_PUBLIC_KEY.jwk',
                privatePath: '/tmp/JOSE_ENCYPTION_PRIVATE_KEY.jwk',
              },
              signKeys: {
                publicPath: '/tmp/JOSE_SIGN_PUBLIC_KEY.jwk',
                privatePath: '/tmp/JOSE_SIGN_PRIVATE_KEY.jwk',
              },
            } satisfies JwtServiceKeyPathOptions;

            const jwtServiceKeys = await JwtService.getKeys(config);

            return new JwtService({
              ...jwtServiceKeys,
              audience: 'AUDIENCE',
              issuer: 'ISSUER',
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
