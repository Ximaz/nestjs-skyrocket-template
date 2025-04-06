import { createKeyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheableMemory } from 'cacheable';
import { Keyv } from 'keyv';

@Global()
@Module({
  imports: [
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
  ],
  exports: [CacheModule],
})
export class GlobalCacheModule {}
