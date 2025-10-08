import { Injectable, NotFoundException } from '@nestjs/common';
import { OpenIdUserInfoResource } from '../oauth/resources/open-id-user-info.resource.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(openidUserInfo: OpenIdUserInfoResource) {
    await this.prismaService.user.upsert({
      create: {
        ...openidUserInfo,
      },
      update: {
        ...openidUserInfo,
        deletedAt: null,
      },
      where: {
        email: openidUserInfo.email,
      },
    });
  }

  // We don't use the email as a unique ID because OpenID providers recommand to
  // use the 'sub' field as this is actually immuable. Although the mail might
  // change, the 'sub' won't, it's the internal user ID. As multiple providers
  // may have different user with the same 'sub' value, unlikely but never zero,
  // we also use the 'iss' to differenciate all users based on the OpenID
  // provider.
  async retrieveMe(openidUserInfo: OpenIdUserInfoResource) {
    try {
      const record = await this.prismaService.user.findFirstOrThrow({
        where: {
          deletedAt: null,
          iss: openidUserInfo.iss,
          sub: openidUserInfo.sub,
        },
        select: {
          iss: true,
          sub: true,
          email: true,
          givenName: true,
          familyName: true,
          picture: true,
        },
      });

      const foundOpenIdUserInfo =
        await OpenIdUserInfoResource.createResource(record);

      return foundOpenIdUserInfo;
    } catch {
      throw new NotFoundException();
    }
  }

  async updateMe(
    oldOpenIdUserInfo: OpenIdUserInfoResource,
    newOpenIdUserInfo: OpenIdUserInfoResource,
  ) {
    await this.prismaService.user.update({
      data: newOpenIdUserInfo,
      where: {
        deletedAt: null,
        iss: oldOpenIdUserInfo.iss,
        sub: oldOpenIdUserInfo.sub,
        email: oldOpenIdUserInfo.email,
      },
    });
  }

  async deleteMe(openidUserInfo: OpenIdUserInfoResource) {
    await this.prismaService.user.update({
      data: {
        deletedAt: new Date(),
      },
      where: {
        deletedAt: null,
        iss: openidUserInfo.iss,
        sub: openidUserInfo.sub,
        email: openidUserInfo.email,
      },
    });
  }
}
