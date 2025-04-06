/** Core */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

/** Caching */
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';

/** Logger */
import { CacheableMemory } from 'cacheable';
import { LoggerModule } from './logger/logger.module';

/** My Modules */
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { Argon2idModule } from './argon2id/argon2id.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        const redisHost = configService.get<string>('REDIS_HOST');

        return {
          stores: [
            // Default cache
            createKeyv(`redis://${redisHost}:6379`),

            // Fallback cache (in-memory)
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
          ],
        };
      },
    }),
    PrismaModule,
    UsersModule,
    Argon2idModule,
    AuthModule,
  ],
})
export class AppModule {}
