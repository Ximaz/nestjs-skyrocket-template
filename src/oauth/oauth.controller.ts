import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { OauthService } from './oauth.service.js';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  OauthAuthorizationRequestDto,
  OauthAuthorizationResponseDto,
} from './dto/authorization.dto.js';
import {
  OauthCallbackRequestDto,
  OauthCallbackResponseDto,
} from './dto/callback.dto.js';
import {
  OauthRefreshRequestDto,
  OauthRefreshResponseDto,
} from './dto/refresh.dto.js';
import { OauthRevokeRequestDto } from './dto/revoke.js';

@Controller('oauth')
@ApiTags('OAuth2.0')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @Get('/authorization/:provider')
  @ApiParam({
    name: 'provider',
    description: 'The OAuth2.0 provider',
    example: 'google',
  })
  @ApiOkResponse({
    type: OauthAuthorizationResponseDto,
    description: 'The URL is correctly generated.',
  })
  @ApiNotFoundResponse({
    description: 'The specified provider is not supported.',
  })
  authorization(
    @Param('provider') provider: string,
    @Query() authorizationDto: OauthAuthorizationRequestDto,
  ): OauthAuthorizationResponseDto {
    const authorizationUrl = this.oauthService.authorization(provider, {
      accessType: authorizationDto.accessType,
      scope: authorizationDto.scope,
      state: authorizationDto.state,
    });

    return { url: authorizationUrl };
  }

  @Get('/callback/:provider')
  @ApiParam({
    name: 'provider',
    description: 'The OAuth2.0 provider',
    example: 'google',
  })
  @ApiOkResponse({
    type: OauthCallbackResponseDto,
    description:
      "The callback was successful, user's info were retrieve correctly.",
  })
  @ApiUnauthorizedResponse({
    description:
      "Some of the callback URL query are invalid. (e.g. 'code' is expired)",
  })
  @ApiNotFoundResponse({
    description: 'The specified provider is not supported.',
  })
  async callback(
    @Param('provider') provider: string,
    @Query() callbackDto: OauthCallbackRequestDto,
  ): Promise<OauthCallbackResponseDto> {
    const { bearerToken, openIdUserInfo } = await this.oauthService.callback(
      provider,
      {
        code: callbackDto.code,
        state: callbackDto.state,
      },
    );

    return { bearerToken, openIdUserInfo };
  }

  @Post('/refresh/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'provider',
    description: 'The OAuth2.0 provider',
    example: 'google',
  })
  @ApiBody({
    type: OauthRefreshRequestDto,
    description: 'All the required information to refresh the access token.',
  })
  @ApiOkResponse({
    type: OauthRefreshResponseDto,
    description:
      "The callback was successful, user's info were retrieve correctly.",
  })
  @ApiUnauthorizedResponse({
    description:
      "Some of the callback URL query are invalid. (e.g. 'code' is expired)",
  })
  @ApiNotFoundResponse({
    description: 'The specified provider is not supported.',
  })
  async refresh(
    @Param('provider') provider: string,
    @Body() refreshDto: OauthRefreshRequestDto,
  ): Promise<OauthRefreshResponseDto> {
    const bearerToken = await this.oauthService.refresh(
      provider,
      refreshDto.refreshToken,
    );

    return { bearerToken };
  }

  @Delete('/revoke/:provider')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({
    name: 'provider',
    description: 'The OAuth2.0 provider',
    example: 'google',
  })
  @ApiNoContentResponse({
    description: 'The given token was correctly revoked.',
  })
  @ApiBadRequestResponse({
    description:
      "The provided token is not revocable. Possible reasons include: the provided token was not crafted by the given provider, it is already revoked, the 'token_type_hint' does not match the 'token''s actual type.",
  })
  @ApiNotFoundResponse({
    description: 'The specified provider is not supported.',
  })
  async revoke(
    @Param('provider') provider: string,
    @Query() revokeDto: OauthRevokeRequestDto,
  ) {
    await this.oauthService.revoke(
      provider,
      revokeDto.token,
      revokeDto.tokenTypeHint,
    );
  }
}
