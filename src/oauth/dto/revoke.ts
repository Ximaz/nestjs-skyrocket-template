import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

enum OauthRevokeTokenTypeHint {
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
}

export class OauthRevokeRequestDto {
  @IsString()
  @ApiProperty({
    description: 'The OAuth2.0 token to revoke.',
  })
  readonly token: string;

  @IsOptional()
  @IsEnum(OauthRevokeTokenTypeHint)
  @Expose({ name: 'token_type_hint' })
  @ApiProperty({
    name: 'token_type_hint',
    description: 'Type of user',
    enum: OauthRevokeTokenTypeHint,
  })
  readonly tokenTypeHint: OauthRevokeTokenTypeHint;
}
