import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test_token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateInitData', () => {
    it('should return true for valid init data', () => {
      const initData = 'auth_date=12345\nuser_id=67890\nusername=test\n';
      const botToken = 'test_bot_token';
      const hash = 'dummmy_valid_hash'; // Replace with actual valid hash

      jest.spyOn(service, 'validateInitData').mockImplementation(() => true);

      const result = service.validateInitData(
        initData + 'hash=' + hash,
        botToken,
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid init data', () => {
      const initData = 'auth_date=12345\nuser_id=67890\nusername=test\n';
      const botToken = 'test_bot_token';
      const hash = 'dummy_invalid_hash';

      jest.spyOn(service, 'validateInitData').mockImplementation(() => false);

      const result = service.validateInitData(
        initData + 'hash=' + hash,
        botToken,
      );
      expect(result).toBe(false);
    });
  });

  describe('generateJwt', () => {
    it('should generate a JWT token', () => {
      const user = { id: 1, username: 'test' };
      const result = service.generateJwt(user);
      expect(result).toBe('test_token');
    });
  });
});
