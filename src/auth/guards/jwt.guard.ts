import * as jose from 'jose';
import { FastifyRequest } from 'fastify';
import { Cache } from 'cache-manager';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from 'src/jwt/jwt.service';
import LoggerService from 'src/logger/logger.service';
import { DecryptedToken, EncryptedToken } from 'src/jwt/entity/token';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly jwtService: JwtService,
    private readonly loggerService: LoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: FastifyRequest = context.switchToHttp().getRequest();
    const token = this.extractBearerToken(request);

    const decryptedToken = await this.validate(token);
    Object.defineProperty(request, 'user', decryptedToken);
    return true;
  }

  private extractBearerToken(request: FastifyRequest): string {
    const authHeader = request.headers.authorization ?? '';
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) throw new UnauthorizedException();
    return token;
  }

  async validate(jwe: EncryptedToken) {
    const isInvalidToken = null !== (await this.cacheService.get<string>(jwe));

    if (isInvalidToken) throw new UnauthorizedException();

    try {
      const decryptedToken: DecryptedToken =
        await this.jwtService.verifyJwe(jwe);

      return decryptedToken;
    } catch (e) {
      if (
        (e instanceof jose.errors.JWTClaimValidationFailed &&
          'iat' === e.claim &&
          'check_failed' === e.reason) ||
        e instanceof jose.errors.JWEInvalid
      )
        throw new UnauthorizedException();
      if (e instanceof Error)
        this.loggerService.error(e.message, e.stack ?? 'No Error stack found.');
      throw new InternalServerErrorException();
    }
  }
}
