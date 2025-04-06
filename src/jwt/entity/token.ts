import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JWTPayload } from 'jose';

export type EncryptedToken = string;

export class BearerToken {
  @ApiProperty({
    description:
      'The encrypted JWT API Bearer token. It must be passed to all protected route via HTTP Authorization header.',
  })
  readonly bearerToken: EncryptedToken;
}

export class DecryptedToken implements JWTPayload {
  [propName: string]: unknown;
  readonly iss?: string | undefined;
  readonly sub?: string | undefined;
  readonly aud?: string | string[] | undefined;
  readonly jti?: string | undefined;
  readonly nbf?: number | undefined;
  readonly exp?: number | undefined;
  readonly iat?: number | undefined;

  readonly userId: User['id'];
}
