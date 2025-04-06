import { ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export default class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: "The user's new firstname.",
    type: String,
  })
  readonly firstname?: User['firstname'];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: "The user's new lastname.",
    type: String,
  })
  readonly lastname?: User['lastname'];

  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional({
    description: "The user's new email.",
    type: String,
  })
  readonly email?: User['email'];

  @IsString()
  @MinLength(8)
  @IsOptional()
  @ApiPropertyOptional({
    description:
      "The user's new password. The user's password. It must contains at least 8 characters.",
    type: String,
    minLength: 8,
  })
  readonly password?: string;
}
