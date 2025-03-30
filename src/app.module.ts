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

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        const redisHost = configService.get<string>('REDIS_HOST');
        const redisPort = configService.get<number>('REDIS_PORT');

        return {
          stores: [
            // Default cache
            createKeyv(`redis://${redisHost}:${redisPort}`),

            // Fallback cache (in-memory)
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
          ],
        };
      },
    }),
    UsersModule,
  ],
})
export class AppModule {}
