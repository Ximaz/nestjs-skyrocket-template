import { Module } from '@nestjs/common';
import { Argon2idService } from './argon2id.service';

@Module({
  providers: [Argon2idService],
  exports: [Argon2idService],
})
export class Argon2idModule {}
