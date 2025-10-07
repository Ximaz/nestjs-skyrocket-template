import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { BearerTokenDto } from './bearer-token.dto.js';

export class OauthRefreshRequestDto {
  @IsString()
  @Expose({ name: 'refresh_token' })
  @ApiProperty({
    name: 'refresh_token',
    description: "The OAuth2.0 refresh token from the initial 'code' exchange.",
  })
  readonly refreshToken: string;
}

export class OauthRefreshResponseDto {
  @ValidateNested()
  @Type(() => BearerTokenDto)
  @Expose({ name: 'bearer_token' })
  @ApiProperty({
    description: 'The new OAuth2.0 bearer token.',
    type: BearerTokenDto,
  })
  readonly bearerToken: BearerTokenDto;
}
