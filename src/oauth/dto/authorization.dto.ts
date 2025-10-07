import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUrl } from 'class-validator';

export enum OauthAuthorizationAccessType {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

export class OauthAuthorizationRequestDto {
  @IsEnum(OauthAuthorizationAccessType)
  @Expose({ name: 'access_type' })
  @ApiProperty({
    name: 'access_type',
    description: 'Type of user',
    enum: OauthAuthorizationAccessType,
  })
  readonly accessType: OauthAuthorizationAccessType;

  @IsString()
  @ApiProperty({
    description: 'The state value for CSRF protection.',
  })
  readonly state: string;

  @IsString()
  @ApiProperty({
    description: 'The scopes required for the OAuth2.0 credential.',
    example: 'openid profile email',
  })
  readonly scope: string;
}

export class OauthAuthorizationResponseDto {
  @IsUrl()
  @ApiProperty({
    description: 'The URL used for the authorization process.',
    example:
      'https://accounts.google.com/o/oauth2/v2/auth?client_id=&scope=&redirect_uri=&state=&response_type=&access_type=',
  })
  readonly url: string;
}
