import { ApiProperty } from '@nestjs/swagger';
import { IsString, ValidateNested } from 'class-validator';
import { OpenIdUserInfo } from './open-id-user-info.dto.js';
import { Type } from 'class-transformer';
import { BearerTokenDto } from './bearer-token.dto.js';

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
  @Type(() => OpenIdUserInfo)
  @ApiProperty({
    description: 'The OpenID user info returned by the OAuth2.0 provider.',
    type: OpenIdUserInfo,
  })
  readonly openIdUserInfo: OpenIdUserInfo;

  @ValidateNested()
  @Type(() => BearerTokenDto)
  @ApiProperty({
    description: 'The Bearer token to use to make API calls to the provider.',
  })
  readonly bearerToken: BearerTokenDto;
}
