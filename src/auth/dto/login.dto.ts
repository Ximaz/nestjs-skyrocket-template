import { User } from '@prisma/client';
import { IsEmail, IsString, MinLength } from 'class-validator';

export default class LoginDto {
  @IsEmail()
  readonly email: User['email'];

  @IsString()
  @MinLength(8)
  readonly password: string;
}
