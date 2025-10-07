import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class BearerTokenDto {
  @IsString()
  @ApiProperty({
    name: 'access_token',
    description:
      "The access token used to make API calls to the OAuth2.0 provider on user's behalf.",
  })
  @Expose({ name: 'access_token' })
  readonly accessToken: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    name: 'refresh_token',
    description:
      'The refresh token used to get a new valid access token. Offline authorization mode only.',
  })
  @Expose({ name: 'refresh_token' })
  readonly refreshToken?: string;

  @IsString()
  @ApiProperty({
    name: 'id_token',
    description: 'A JWT containing the Open ID user information.',
  })
  @Expose({ name: 'id_token' })
  readonly idToken: string;

  @IsString()
  @ApiProperty({
    description:
      'The granted scopes to the access token. Always check it to make sure you have everything you need to operate. If not, redirect the user to another authorization page.',
    example: 'openid profile email',
  })
  @Expose()
  readonly scope: string;

  @IsNumber()
  @ApiProperty({
    name: 'expires_in',
    description:
      'The time frame in which the access token is valid. Beyond, refresh it using the refresh token. Value in seconds',
    example: 3599,
  })
  @Expose({ name: 'expires_in' })
  readonly expiresIn: number;

  @IsIn(['Bearer'])
  @ApiProperty({
    name: 'token_type',
    description: 'The access token type.',
    example: 'Bearer',
  })
  @Expose({ name: 'token_type' })
  readonly tokenType: 'Bearer';
}
