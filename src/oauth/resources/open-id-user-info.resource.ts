import { ApiProperty } from '@nestjs/swagger';
import { Expose, instanceToPlain, plainToInstance } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  validateOrReject,
} from 'class-validator';
import { IOpenIdUserInfo } from '../entities/IOpenIdUserInfo.js';

export class OpenIdUserInfoResource {
  @IsString()
  @ApiProperty({
    description:
      'The issuer of the ID token. Identifies the OAuth2.0 provider.',
    example: 'https://accounts.google.com',
  })
  @Expose()
  readonly iss: string;

  @IsString()
  @ApiProperty({
    description:
      'The unique ID given by the provider. It is recommanded to prefix this value by the name of the provider when storing it if multiple providers are being supported, as the raw ID may already be in-use by another provider.',
  })
  @Expose()
  readonly sub: string;

  @IsEmail()
  @ApiProperty({
    description: 'The email address of the authorized user.',
    example: 'john.doe@example.com',
  })
  @Expose()
  readonly email: string;

  @IsString()
  @ApiProperty({
    description: 'The firstname of the authorized user.',
    example: 'John',
  })
  @Expose({ name: 'given_name' })
  readonly givenName: string;

  @IsString()
  @ApiProperty({
    description: 'The lastname of the authorized user.',
    example: 'DOE',
  })
  @Expose({ name: 'family_name' })
  readonly familyName: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty({
    description:
      "An URL to the authorized user's profile picture, if the access was granted.",
  })
  @Expose()
  readonly picture?: string;

  static createEntity(resource: OpenIdUserInfoResource): IOpenIdUserInfo {
    const entity = instanceToPlain(resource, {
      excludeExtraneousValues: true,
    });

    return entity as IOpenIdUserInfo;
  }

  static async createResource(
    entity: unknown,
  ): Promise<OpenIdUserInfoResource> {
    const resource = plainToInstance(OpenIdUserInfoResource, entity, {
      excludeExtraneousValues: true,
    });

    await validateOrReject(resource);

    return resource;
  }
}
