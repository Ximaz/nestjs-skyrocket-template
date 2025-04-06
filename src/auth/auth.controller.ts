import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import LoginDto from './dto/login.dto';
import { AuthService } from './auth.service';
import RegisterDto from './dto/register.dto';
import { JwtGuard } from './guards/jwt.guard';
import { AuthenticatedRequest } from 'typings';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('/logout')
  @UseGuards(JwtGuard)
  logout(@Req() req: AuthenticatedRequest) {
    return this.authService.logout(req);
  }
}
