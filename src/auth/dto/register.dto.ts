import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { IsEmail, IsString, MinLength } from 'class-validator';

export default class RegisterDto {
  @IsString()
  @ApiProperty({
    description: "The user's firstname.",
    type: String,
  })
  readonly firstname: User['firstname'];

  @IsString()
  @ApiProperty({
    description: "The user's lastname.",
    type: String,
  })
  readonly lastname: User['lastname'];

  @IsEmail()
  @ApiProperty({
    description: "The user's email address.",
    type: String,
  })
  readonly email: User['email'];

  @IsString()
  @MinLength(8)
  @ApiProperty({
    description: "The user's password. It must contains at least 8 characters.",
    minLength: 8,
  })
  readonly password: string;
}
