import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockImplementation((payload, options) => {
              if (options.expiresIn === '60m') {
                return 'access_token';
              } else if (options.expiresIn === '7d') {
                return 'refresh_token';
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateInitData', () => {
    it('should return true for valid init data', () => {
      const initData = 'auth_date=12345\nuser_id=67890\nusername=test\n';
      const botToken = 'test_bot_token';
      const hash = 'dummmy_valid_hash';

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

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const user = { id: 1, username: 'test' };
      const tokens = service.generateTokens(user);

      expect(tokens).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });
    });

    it('should call JwtService sign method twice with correct parameters', () => {
      const user = { id: 1, username: 'test' };
      service.generateTokens(user);

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: user.id, username: user.username },
        { expiresIn: '60m' },
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: user.id, username: user.username },
        { expiresIn: '7d' },
      );
    });
  });
});
