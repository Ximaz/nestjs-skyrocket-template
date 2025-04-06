import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import LoggerService from 'src/logger/logger.service';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import UpdateUserDto from './dto/update-user.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('/users')
@UseInterceptors(CacheInterceptor)
export class UsersController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly usersService: UsersService,
  ) {}

  @Get('/')
  @UseGuards(JwtGuard)
  index(
    @Query('pageNumber', ParseIntPipe) pageNumber: number = 0,
    @Query('pageSize', ParseIntPipe) pageSize: number = 100,
  ) {
    this.loggerService.debug(
      `[UsersController::index]: pageNumber = ${pageNumber}; pageSize = ${pageSize}`,
    );
    return this.usersService.index({ pageNumber, pageSize });
  }

  @Get('/:id')
  @UseGuards(JwtGuard)
  retrieve(@Param('id') id: User['id']) {
    this.loggerService.debug(`[UsersController::retrieve]: id = ${id}`);
    return this.usersService.retrieve(id);
  }

  @Patch('/:id')
  @UseGuards(JwtGuard)
  update(@Param('id') id: User['id'], @Body() updateUserDto: UpdateUserDto) {
    this.loggerService.debug(
      `[UsersController::update]: id = ${id}; updateUserDto: ${JSON.stringify(updateUserDto)}`,
    );
    return this.usersService.update(id, updateUserDto);
  }

  @Delete('/:id')
  @UseGuards(JwtGuard)
  delete(@Param('id') id: User['id']) {
    this.loggerService.debug(`[UsersController::delete]: id = ${id}`);
    return this.usersService.delete(id);
  }
}
