import { ApiProperty } from '@nestjs/swagger';
import { IsString, ValidateNested } from 'class-validator';
import { OpenIdUserInfoResource } from '../resources/open-id-user-info.resource.js';
import { Type } from 'class-transformer';

export class OauthCallbackRequestDto {
  @IsString()
  @ApiProperty({
    description: 'The state value for CSRF protection.',
  })
  readonly state: string;

  @IsString()
  @ApiProperty({
    description:
      'The OAuth2.0 code to be exchanged for actual OAuth2.0 credentials.',
  })
  readonly code: string;
}

export class OauthCallbackResponseDto {
  @ValidateNested()
  @Type(() => OpenIdUserInfoResource)
  @ApiProperty({
    description: 'The OpenID user info returned by the OAuth2.0 provider.',
    type: OpenIdUserInfoResource,
  })
  readonly openIdUserInfo: OpenIdUserInfoResource;

  @IsString()
  @ApiProperty({
    description: 'The Bearer token to use to make API calls to the provider.',
  })
  readonly bearerToken: string;
}
