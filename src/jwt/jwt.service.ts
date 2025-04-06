import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CryptoKey,
  importSPKI,
  importPKCS8,
  SignJWT,
  CompactEncrypt,
  compactDecrypt,
  jwtVerify,
} from 'jose';
import { BearerToken, DecryptedToken, EncryptedToken } from './entity/token';

@Injectable()
export class JwtService {
  private secret: Uint8Array;
  private issuer: string;
  private expiresIn: string;
  private jwtRSAPublicKey: string;
  private publicKey: CryptoKey | null = null;
  private jwtRSAPrivateKey: string;
  private privateKey: CryptoKey | null = null;
  public static JWS_ALG: string = 'HS512';
  public static JWE_ALG: string = 'RSA-OAEP-512';
  public static JWE_ENC: string = 'A256GCM';

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    if (32 !== secret.length)
      throw new Error('The JWS secret key must be 32 bytes long.');
    this.secret = new TextEncoder().encode(secret);

    this.issuer = this.configService.getOrThrow<string>('JWT_ISSUER');

    this.expiresIn = this.configService.getOrThrow<string>('JWT_EXPIRES_IN');

    this.jwtRSAPublicKey =
      this.configService.getOrThrow<string>('JWE_PUBLIC_KEY');

    this.jwtRSAPrivateKey =
      this.configService.getOrThrow<string>('JWE_PRIVATE_KEY');
  }

  private async loadPublicKey() {
    this.publicKey = await importSPKI(this.jwtRSAPublicKey, JwtService.JWE_ALG);
  }

  private async loadPrivateKey() {
    this.privateKey = await importPKCS8(
      this.jwtRSAPrivateKey,
      JwtService.JWE_ALG,
    );
  }

  async forgeJwe(payload: DecryptedToken): Promise<BearerToken> {
    const jws = await new SignJWT(payload)
      .setProtectedHeader({ alg: JwtService.JWS_ALG })
      .setIssuedAt()
      .setIssuer(this.issuer)
      .setExpirationTime(this.expiresIn)
      .sign(this.secret);
    const encodedJws = new TextEncoder().encode(jws);

    if (null === this.publicKey) await this.loadPublicKey();
    const jwe = await new CompactEncrypt(encodedJws)
      .setProtectedHeader({
        alg: JwtService.JWE_ALG,
        enc: JwtService.JWE_ENC,
      })
      .encrypt(this.publicKey!);

    return { bearerToken: jwe };
  }

  async decryptJwe(jwe: EncryptedToken): Promise<string> {
    if (null === this.privateKey) await this.loadPrivateKey();
    const { plaintext: encodedJws } = await compactDecrypt(
      jwe,
      this.privateKey!,
      {
        keyManagementAlgorithms: [JwtService.JWE_ALG],
        contentEncryptionAlgorithms: [JwtService.JWE_ENC],
      },
    );

    const jws = new TextDecoder().decode(encodedJws);
    return jws;
  }

  async verifyJwe(jwe: EncryptedToken): Promise<DecryptedToken> {
    const jws = await this.decryptJwe(jwe);
    const { payload } = await jwtVerify(jws, this.secret, {
      issuer: this.issuer,
      algorithms: [JwtService.JWS_ALG],
      maxTokenAge: this.expiresIn,
    });
    return payload as DecryptedToken;
  }
}
