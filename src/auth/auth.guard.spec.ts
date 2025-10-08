import { JwtService, JwtServiceKeyPathOptions } from '../jwt/jwt.service.js';
import { AuthGuard } from './auth.guard.js';

describe('AuthGuard', () => {
  it('should be defined', async () => {
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

    const jwtService = new JwtService({
      ...jwtServiceKeys,
      audience: 'AUDIENCE',
      issuer: 'ISSUER',
    });

    expect(new AuthGuard(jwtService)).toBeDefined();
  });
});
