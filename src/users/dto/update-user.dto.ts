import { User } from '@prisma/client';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export default class UpdateUserDto {
  @IsString()
  @IsOptional()
  readonly firstname?: User['firstname'];

  @IsString()
  @IsOptional()
  readonly lastname?: User['lastname'];

  @IsEmail()
  @IsOptional()
  readonly email?: User['email'];

  @IsString()
  @MinLength(8)
  @IsOptional()
  readonly password?: string;
}
