import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { JwtService } from '../jwt/jwt.service.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = this.extractBearerToken(request);

    try {
      const payload = await this.jwtService.verify(token);

      Object.defineProperty(request, 'user', {
        configurable: true,
        value: payload.user,
      });
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractBearerToken(request: FastifyRequest): string {
    const authHeader = request.headers.authorization ?? '';
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) throw new UnauthorizedException();
    return token;
  }
}
