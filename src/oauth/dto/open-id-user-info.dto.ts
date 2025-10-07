import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class OpenIdUserInfo {
  @IsString()
  @ApiProperty({
    description:
      'The unique ID given by the provider. It is recommanded to prefix this value by the name of the provider when storing it if multiple providers are being supported, as the raw ID may already be in-use by another provider.',
  })
  @Expose()
  readonly sub: string;

  @IsEmail()
  @ApiProperty({
    description: 'The email address of the authorized user.',
    example: 'john.doe@example.com',
  })
  @Expose()
  readonly email: string;

  @IsString()
  @ApiProperty({
    description: 'The firstname of the authorized user.',
    example: 'John',
  })
  @Expose({ name: 'given_name' })
  readonly givenName: string;

  @IsString()
  @ApiProperty({
    description: 'The lastname of the authorized user.',
    example: 'DOE',
  })
  @Expose({ name: 'family_name' })
  readonly familyName: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({
    description:
      "An URL to the authorized user's profile picture, if the access was granted.",
  })
  @Expose()
  readonly picture?: string;
}
