import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtServiceKeyPathOptions } from './jwt.service.js';

@Module({
  providers: [
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
  exports: [JwtService],
})
export class JwtModule {}
