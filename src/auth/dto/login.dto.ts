import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { IsEmail, IsString, MinLength } from 'class-validator';

export default class LoginDto {
  @IsEmail()
  @ApiProperty({
    description: 'The email address of the account.',
    type: String,
  })
  readonly email: User['email'];

  @IsString()
  @MinLength(8)
  @ApiProperty({
    description:
      'The password of the account. It must contain at least 8 characters.',
    minLength: 8,
  })
  readonly password: string;
}
