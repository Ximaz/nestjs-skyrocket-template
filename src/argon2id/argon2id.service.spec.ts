import { Test, TestingModule } from '@nestjs/testing';
import { Argon2idService } from './argon2id.service';

describe('Argon2idService', () => {
  let service: Argon2idService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Argon2idService],
    }).compile();

    service = module.get<Argon2idService>(Argon2idService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
