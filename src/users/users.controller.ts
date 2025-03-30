import { Controller, Logger } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly logger: Logger) {
    logger.log('This is simply a test log.', 'MY_LOG_TITLE');
  }
}
