import { Controller, Delete, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { AuthGuard } from '../auth/auth.guard.js';
import { OpenIdUserInfoResource } from '../oauth/resources/open-id-user-info.resource.js';
import { UsersService } from './users.service.js';

@ApiUnauthorizedResponse({
  description:
    'The client is trying to access the route without being authenticated.',
})
@ApiBearerAuth('bearer')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  @UseGuards(AuthGuard)
  @ApiOkResponse({
    description: 'The user was found and its attributes are returned.',
    type: OpenIdUserInfoResource,
  })
  @ApiNotFoundResponse({
    description:
      "The user is authenticated but its account was deleted. Until the token expires, the user won't be found in database.",
  })
  async retrieveMe(@Req() request: FastifyRequest) {
    const token = request['user'] as OpenIdUserInfoResource;

    const user = await this.usersService.retrieveMe(token);

    return user;
  }

  @Delete('/me')
  @UseGuards(AuthGuard)
  @ApiNoContentResponse({
    description: 'The user was found and has been deleted.',
  })
  @ApiNotFoundResponse({
    description:
      "The user is authenticated but its account was deleted. Until the token expires, the user won't be found in database.",
  })
  async deleteMe(@Req() request: FastifyRequest) {
    const token = request['user'] as OpenIdUserInfoResource;

    await this.usersService.deleteMe(token);
  }
}
