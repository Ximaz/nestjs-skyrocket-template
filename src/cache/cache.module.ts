import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import Keyv, { KeyvStoreAdapter } from 'keyv';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        const redisHost = configService.get<string>('REDIS_HOST')!;

        return {
          stores: [
            new KeyvRedis<string>(`redis://${redisHost}:6379`),
            new Keyv<string>({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }) as unknown as KeyvStoreAdapter,
          ] satisfies KeyvStoreAdapter[],
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class GlobalCacheModule {}
