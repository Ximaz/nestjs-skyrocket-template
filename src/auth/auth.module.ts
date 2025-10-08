import { Global, Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';
import { JwtModule } from '../jwt/jwt.module.js';
import { JwtService } from '../jwt/jwt.service.js';

@Global()
@Module({
  imports: [JwtModule],
  providers: [
    {
      provide: AuthGuard,
      inject: [JwtService],
      useFactory: (jwtService: JwtService) => {
        return new AuthGuard(jwtService);
      },
    },
  ],
  exports: [AuthGuard],
})
export class AuthModule {}
