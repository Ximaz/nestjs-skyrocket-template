import {
  BadRequestException,
  Injectable,
  Logger,
  LoggerService,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { OpenIdUserInfo } from './dto/open-id-user-info.dto.js';
import { BearerTokenDto } from './dto/bearer-token.dto.js';
import { IOAuthProvider } from 'src/types/IOauthProvider.js';

@Injectable()
export class OauthService {
  private readonly loggerService: LoggerService = new Logger();

  constructor(
    private readonly oauthProviders: Record<string, IOAuthProvider>,
  ) {}

  authorization(
    provider: string,
    params: {
      scope: string;
      accessType: 'online' | 'offline';
      state: string;
    },
  ): string {
    const oauthProvider = this.oauthProviders[provider];
    if (undefined === oauthProvider) {
      throw new NotFoundException(`Unknown OAuth2.0 provider : ${provider}`);
    }

    const url = new URL(oauthProvider.AUTHORIZATION_URL);

    url.searchParams.set('client_id', oauthProvider.CLIENT_ID);
    url.searchParams.set('scope', params.scope);
    url.searchParams.set('redirect_uri', oauthProvider.REDIRECT_URI);
    url.searchParams.set('state', params.state);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('access_type', params.accessType);

    return url.toString();
  }

  async callback(
    provider: string,
    params: {
      code: string;
      state: string;
    },
  ): Promise<{ bearerToken: BearerTokenDto; openIdUserInfo: OpenIdUserInfo }> {
    const oauthProvider = this.oauthProviders[provider];
    if (undefined === oauthProvider) {
      throw new NotFoundException(`Unknown OAuth2.0 provider : ${provider}`);
    }

    const response = await fetch(oauthProvider.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: params.code,
        redirect_uri: oauthProvider.REDIRECT_URI,
        client_id: oauthProvider.CLIENT_ID,
        client_secret: oauthProvider.CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.loggerService.error(error);
      throw new UnauthorizedException('Unable to exchange OAuth2.0 code');
    }

    const data = (await response.json()) as unknown;

    this.loggerService.debug?.(JSON.stringify(data));

    const bearerToken = plainToInstance(BearerTokenDto, data, {
      excludeExtraneousValues: true,
    });

    let openIdUserInfo: OpenIdUserInfo;
    if (bearerToken.idToken) {
      openIdUserInfo = plainToInstance(
        OpenIdUserInfo,
        jwt.decode(bearerToken.idToken, {
          json: true,
        }),
        {
          excludeExtraneousValues: true,
        },
      );
      await validateOrReject(openIdUserInfo);
    } else {
      openIdUserInfo = await this.getUserInfo(
        oauthProvider,
        bearerToken.accessToken,
      );
    }

    return { bearerToken, openIdUserInfo };
  }

  async refresh(
    provider: string,
    refreshToken: string,
  ): Promise<BearerTokenDto> {
    const oauthProvider = this.oauthProviders[provider];
    if (undefined === oauthProvider) {
      throw new NotFoundException(`Unknown OAuth2.0 provider : ${provider}`);
    }

    const response = await fetch(oauthProvider.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: oauthProvider.CLIENT_ID,
        client_secret: oauthProvider.CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.loggerService.error(error);
      throw new UnauthorizedException(
        'Unable to refresh OAuth2.0 access token',
      );
    }

    const data = (await response.json()) as unknown;

    const bearerToken = plainToInstance(BearerTokenDto, data, {
      excludeExtraneousValues: true,
    });
    await validateOrReject(bearerToken);

    return bearerToken;
  }

  async revoke(
    provider: string,
    token: string,
    tokenTypeHint?: 'access_token' | 'refresh_token',
  ) {
    const oauthProvider = this.oauthProviders[provider];
    if (undefined === oauthProvider) {
      throw new NotFoundException(`Unknown OAuth2.0 provider : ${provider}`);
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      token,
      client_id: oauthProvider.CLIENT_ID,
      client_secret: oauthProvider.CLIENT_SECRET,
    });

    if (undefined !== tokenTypeHint) {
      body.append('token_type_hint', tokenTypeHint);
    }

    const response = await fetch(oauthProvider.REVOKE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      const error = await response.text();
      this.loggerService.error(error);
      throw new BadRequestException('Unable to refresh OAuth2.0 access token');
    }
  }

  private async getUserInfo(
    oauthProvider: IOAuthProvider,
    accessToken: string,
  ): Promise<OpenIdUserInfo> {
    const response = await fetch(oauthProvider.OPENID_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      this.loggerService.error(error);
      throw new UnauthorizedException();
    }

    const data = (await response.json()) as unknown;

    const openIdUserInfo = plainToInstance(OpenIdUserInfo, data, {
      excludeExtraneousValues: true,
    });
    await validateOrReject(openIdUserInfo);

    return openIdUserInfo;
  }
}
