import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import UpdateUserDto from './dto/update-user.dto';
import LoggerService from 'src/logger/logger.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import User, { UserIndex, UserRetrieve } from './entities/user.entity';
import { AuthenticatedRequest } from 'typings';

@Controller('users')
@UseGuards(JwtGuard)
@UseInterceptors(CacheInterceptor)
@CacheTTL(1000)
@ApiTags('Users')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({
  description: 'The provided encrypted JWT API Bearer token is invalid.',
})
export class UsersController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiOkResponse({
    description: 'Returns a list of users in the given range.',
    type: UserIndex,
    isArray: true,
  })
  @ApiQuery({
    name: 'pageNumber',
    description: 'The page index, starting from 0.',
    type: Number,
    default: 0,
    required: true,
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'The number of result in the requested page.',
    type: Number,
    default: 100,
    required: true,
  })
  index(
    @Query('pageNumber', ParseIntPipe) pageNumber: number = 0,
    @Query('pageSize', ParseIntPipe) pageSize: number = 100,
  ): Promise<UserIndex[]> {
    this.loggerService.debug(
      `[UsersController::index]: pageNumber = ${pageNumber}; pageSize = ${pageSize}`,
    );
    return this.usersService.index({ pageNumber, pageSize });
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: "The user's ID to retrieve the information of.",
    type: String,
  })
  @ApiOkResponse({
    description: 'Returns the information of a user.',
    type: UserRetrieve,
  })
  retrieve(
    @Param('id') id: User['id'],
    @Req() req: AuthenticatedRequest,
  ): Promise<UserRetrieve> {
    this.loggerService.debug(`[UsersController::retrieve]: id = ${id}`);
    return this.usersService.retrieve(id, req);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({
    name: 'id',
    description: "The user's ID on which to perform the operation.",
    type: String,
  })
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiNoContentResponse({
    description: 'The action was successfully executed.',
  })
  @ApiForbiddenResponse({
    description: 'The user has not the permission to perform this action.',
  })
  update(
    @Param('id') id: User['id'],
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    this.loggerService.debug(
      `[UsersController::update]: id = ${id}; updateUserDto: ${JSON.stringify(updateUserDto)}`,
    );
    return this.usersService.update(id, updateUserDto, req);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({
    name: 'id',
    description: "The user's ID on which to perform the operation.",
    type: String,
  })
  @ApiNoContentResponse({
    description: 'The action was successfully executed.',
  })
  @ApiForbiddenResponse({
    description: 'The user has not the permission to perform this action.',
  })
  delete(
    @Param('id') id: User['id'],
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    this.loggerService.debug(`[UsersController::delete]: id = ${id}`);
    return this.usersService.delete(id, req);
  }
}
