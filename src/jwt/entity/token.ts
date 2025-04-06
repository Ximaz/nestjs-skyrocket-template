import { User } from '@prisma/client';
import { JWTPayload } from 'jose';

export type EncryptedToken = string;

export type BearerToken = { bearerToken: EncryptedToken };

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
