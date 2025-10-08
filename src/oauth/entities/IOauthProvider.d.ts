export declare interface IOAuthProvider {
  readonly CLIENT_ID: string;
  readonly CLIENT_SECRET: string;
  readonly AUTHORIZATION_URL: string;
  readonly REDIRECT_URI: string;
  readonly TOKEN_URL: string;
  readonly REVOKE_URL: string;
  readonly OPENID_URL: string;
}
