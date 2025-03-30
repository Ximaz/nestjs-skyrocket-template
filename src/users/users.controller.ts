import { CACHE_MANAGER, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import LoggerService from 'src/logger/logger.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly logger: LoggerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  @CacheKey('response')
  @CacheTTL(10000)
  test() {
    return {
      data: [
        {
          first_name: 'Timothy',
          last_name: 'Mendoza',
          email: 'amy13@silva.biz',
          age: 80,
          phone: '737.495.7496',
          address: '6550 Julie Run, South Jennyburgh, CA 52190',
          postal_code: '42601',
        },
        {
          first_name: 'Tiffany',
          last_name: 'Pace',
          email: 'rebecca84@hotmail.com',
          age: 68,
          phone: '669-266-9091x99612',
          address: 'PSC 2157, Box 2228, APO AA 65145',
          postal_code: '10322',
        },
        {
          first_name: 'Michele',
          last_name: 'Rowe',
          email: 'adoyle@johnson.com',
          age: 36,
          phone: '+1-448-894-1097',
          address: 'Unit 3190 Box 2271, DPO AE 84647',
          postal_code: '18240',
        },
        {
          first_name: 'Gregory',
          last_name: 'Wang',
          email: 'manuel40@gmail.com',
          age: 39,
          phone: '001-044-911-6718x0622',
          address: '01370 Hamilton Loaf, Port Ashleyberg, MN 56646',
          postal_code: '22942',
        },
        {
          first_name: 'Jon',
          last_name: 'Whitaker',
          email: 'tdiaz@chen-barber.com',
          age: 62,
          phone: '(055)677-4998x0810',
          address: '2042 Love Turnpike Apt. 587, Hickstown, PA 90288',
          postal_code: '78276',
        },
        {
          first_name: 'Angela',
          last_name: 'Mathis',
          email: 'fcraig@gmail.com',
          age: 58,
          phone: '873-569-7440',
          address: '54558 Seth Mountains Apt. 603, North Judyborough, CA 40190',
          postal_code: '61846',
        },
      ],
    };
  }
}
