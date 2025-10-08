import {
  BadRequestException,
  Injectable,
  LoggerService,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { OpenIdUserInfoResource } from './resources/open-id-user-info.resource.js';
import { BearerTokenResource } from './resources/bearer-token.resource.js';
import { IOAuthProvider } from './entities/IOauthProvider.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '../jwt/jwt.service.js';

@Injectable()
export class OauthService {
  constructor(
    private readonly oauthProviders: Record<string, IOAuthProvider>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly loggerService: LoggerService,
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
  ): Promise<{ bearerToken: string; openIdUserInfo: OpenIdUserInfoResource }> {
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

    const bearerToken = await BearerTokenResource.createResource(data);

    await this.revoke(provider, bearerToken.accessToken, 'access_token');
    if (bearerToken.refreshToken) {
      await this.revoke(provider, bearerToken.refreshToken, 'refresh_token');
    }

    let openIdUserInfo: OpenIdUserInfoResource;
    if (bearerToken.idToken) {
      openIdUserInfo = await OpenIdUserInfoResource.createResource(
        jwt.decode(bearerToken.idToken, {
          json: true,
        }),
      );
    } else {
      openIdUserInfo = await this.getUserInfo(
        oauthProvider,
        bearerToken.accessToken,
      );
    }

    try {
      const oldOpenIdUserInfo =
        await this.usersService.retrieveMe(openIdUserInfo);

      const newOpenIdUserInfo = await OpenIdUserInfoResource.createResource({
        ...oldOpenIdUserInfo,
        ...openIdUserInfo,
      });

      await this.usersService.updateMe(openIdUserInfo, newOpenIdUserInfo);
    } catch {
      await this.usersService.create(openIdUserInfo);
    }

    const apiBearerToken = await this.jwtService.create(
      { user: openIdUserInfo },
      60 * 60 * 24 * 7,
    );

    return { bearerToken: apiBearerToken, openIdUserInfo };
  }

  async refresh(
    provider: string,
    refreshToken: string,
  ): Promise<BearerTokenResource> {
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

    const bearerToken = await BearerTokenResource.createResource(data);

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
  ): Promise<OpenIdUserInfoResource> {
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

    const openIdUserInfo = await OpenIdUserInfoResource.createResource(data);

    return openIdUserInfo;
  }
}
