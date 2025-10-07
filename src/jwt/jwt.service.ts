import { KeyObject } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { Injectable } from '@nestjs/common';
import {
  compactDecrypt,
  CompactEncrypt,
  exportJWK,
  generateKeyPair,
  importJWK,
  JWK,
  JWTPayload,
  jwtVerify,
  SignJWT,
} from 'jose';

declare type JwtServiceKey =
  | CryptoKey
  | KeyObject
  | JWK
  | Uint8Array<ArrayBufferLike>;

export declare interface JwtServiceKeyPathOptions {
  encryptKeys: {
    publicPath: string;
    privatePath: string;
  };
  signKeys: {
    publicPath: string;
    privatePath: string;
  };
}

declare interface JwtServiceKeys {
  encryptKeys: {
    public: JwtServiceKey;
    private: JwtServiceKey;
  };
  signKeys: {
    public: JwtServiceKey;
    private: JwtServiceKey;
  };
}

@Injectable()
export class JwtService {
  private static readonly JOSE_ALG = 'RSA-OAEP-256';
  private static readonly JOSE_ENC = 'A256GCM';
  private static readonly JWT_ALG = 'RS256';

  constructor(
    private readonly options: JwtServiceKeys & {
      issuer: string;
      audience: string;
    },
  ) {
    this.options = options;
  }

  private static async saveKey(path: string, key: JWK) {
    await writeFile(path, JSON.stringify(key, null, 0), {
      encoding: 'ascii',
      mode: 0o600,
    });
  }

  private static async exportKeyPair(
    alg: string,
    options: {
      publicPath: string;
      privatePath: string;
    },
  ): Promise<{ public: JWK; private: JWK }> {
    const { publicKey, privateKey } = await generateKeyPair(alg, {
      modulusLength: 4096,
      extractable: true,
    });

    const publicJWK = await exportJWK(publicKey);
    await JwtService.saveKey(options.publicPath, {
      ...publicJWK,
      alg: publicKey.algorithm.name,
      // alg: alg,
    });

    const privateJWK = await exportJWK(privateKey);
    await JwtService.saveKey(options.privatePath, {
      ...privateJWK,
      alg: privateKey.algorithm.name,
      // alg: alg,
    });

    return {
      public: publicJWK,
      private: privateJWK,
    };
  }

  private static async exportKeyPairs(
    options: JwtServiceKeyPathOptions,
  ): Promise<JwtServiceKeys> {
    const encryptKeys = await JwtService.exportKeyPair(
      JwtService.JOSE_ALG,
      options.encryptKeys,
    );

    const signKeys = await JwtService.exportKeyPair(
      JwtService.JWT_ALG,
      options.signKeys,
    );

    return {
      encryptKeys,
      signKeys,
    };
  }

  private static async loadKey(path: string) {
    const rawJwk = await readFile(path, 'ascii');

    const jwk = JSON.parse(rawJwk) as JWK;

    return jwk;
  }

  private static async loadKeyPair(
    alg: string,
    options: {
      publicPath: string;
      privatePath: string;
    },
  ) {
    const publicRawJWK = await JwtService.loadKey(options.publicPath);
    const publicJWK = await importJWK(publicRawJWK, alg);

    const privateRawJWK = await JwtService.loadKey(options.privatePath);
    const privateJWK = await importJWK(privateRawJWK, alg);

    return { public: publicJWK, private: privateJWK };
  }

  private static async loadKeyPairs(
    options: JwtServiceKeyPathOptions,
  ): Promise<JwtServiceKeys | null> {
    try {
      const encryptKeys = await JwtService.loadKeyPair(
        JwtService.JOSE_ALG,
        options.encryptKeys,
      );

      const signKeys = await JwtService.loadKeyPair(
        JwtService.JWT_ALG,
        options.signKeys,
      );

      return {
        encryptKeys,
        signKeys,
      };
    } catch {
      return null;
    }
  }

  static async getKeys(
    options: JwtServiceKeyPathOptions,
  ): Promise<JwtServiceKeys> {
    const keys = await JwtService.loadKeyPairs(options);
    if (null !== keys) return keys;
    return await JwtService.exportKeyPairs(options);
  }

  async create(payload: JWTPayload, expiresIn: number) {
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: JwtService.JWT_ALG, typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime(new Date(Date.now() + expiresIn))
      .setAudience(this.options.audience)
      .setIssuer(this.options.issuer)
      .sign(this.options.signKeys.private);

    const jwe = await new CompactEncrypt(new TextEncoder().encode(jwt))
      .setProtectedHeader({
        alg: JwtService.JOSE_ALG,
        enc: JwtService.JOSE_ENC,
      })
      .encrypt(this.options.encryptKeys.public);

    return jwe;
  }

  async verify(jwe: string): Promise<JWTPayload> {
    const jwt = await compactDecrypt(jwe, this.options.encryptKeys.private, {
      keyManagementAlgorithms: [JwtService.JOSE_ALG],
      contentEncryptionAlgorithms: [JwtService.JOSE_ENC],
    });

    const { payload } = await jwtVerify(
      jwt.plaintext,
      this.options.signKeys.public,
      {
        algorithms: [JwtService.JWT_ALG],
        audience: this.options.audience,
        issuer: this.options.issuer,
        requiredClaims: ['user'],
        typ: 'JWT',
      },
    );

    return payload;
  }
}
