import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import LoginDto from './dto/login.dto';
import { AuthService } from './auth.service';
import RegisterDto from './dto/register.dto';
import { JwtGuard } from './guards/jwt.guard';
import { AuthenticatedRequest } from 'typings';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BearerToken } from 'src/jwt/entity/token';

@Controller('/auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description: 'The login information to authenticate.',
    type: LoginDto,
  })
  @ApiOkResponse({
    description: 'Returns an encrypted JWT API Bearer token.',
    type: BearerToken,
  })
  @ApiUnauthorizedResponse({
    description: 'The email and / or the password are invalid.',
  })
  login(@Body() loginDto: LoginDto): Promise<BearerToken> {
    return this.authService.login(loginDto);
  }

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description:
      'Create a new user account. Returns an encrypted JWT API Bearer token.',
    type: BearerToken,
  })
  @ApiConflictResponse({
    description: 'The email is already taken.',
  })
  register(@Body() registerDto: RegisterDto): Promise<BearerToken> {
    return this.authService.register(registerDto);
  }

  @Post('/logout')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('bearer')
  @ApiNoContentResponse({
    description: 'Invalidates the encrypted JWT API Bearer token via caching.',
  })
  @ApiUnauthorizedResponse({
    description: 'The provided encrypted JWT API Bearer token is invalid.',
  })
  logout(@Req() req: AuthenticatedRequest): Promise<void> {
    return this.authService.logout(req);
  }
}
