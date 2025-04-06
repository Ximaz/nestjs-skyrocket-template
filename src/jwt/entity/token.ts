import { User } from '@prisma/client';

export type EncryptedToken = string;

export type BearerToken = { bearerToken: EncryptedToken };

export class DecryptedToken {
  readonly userId: User['id'];
}
