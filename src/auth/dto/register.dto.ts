import { User } from '@prisma/client';
import { IsEmail, IsString, MinLength } from 'class-validator';

export default class RegisterDto {
  @IsString()
  readonly firstname: User['firstname'];

  @IsString()
  readonly lastname: User['lastname'];

  @IsEmail()
  readonly email: User['email'];

  @IsString()
  @MinLength(8)
  readonly password: string;
}
