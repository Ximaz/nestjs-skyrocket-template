import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller.js';
import { mockDeep } from 'jest-mock-extended';
import { UsersService } from './users.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { JwtService } from '../jwt/jwt.service.js';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [
        {
          provide: UsersService,
          useValue: mockDeep<UsersService>(),
        },
      ],
      controllers: [UsersController],
    })
      .overrideProvider(JwtService)
      .useValue(mockDeep<JwtService>())
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
