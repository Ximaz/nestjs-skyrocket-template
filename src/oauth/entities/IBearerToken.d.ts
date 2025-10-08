export declare interface IBearerToken {
  readonly access_token: string;
  readonly refresh_token?: string;
  readonly id_token: string;
  readonly scope: string;
  readonly expires_in: number;
  readonly token_type: 'Bearer';
}
