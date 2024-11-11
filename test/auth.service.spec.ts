import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { Model } from 'mongoose';
import { AuthService } from '../src/modules/auth/auth.service';
import { User } from '../src/models/entities/user.entity';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userModel: Model<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn().mockImplementation((userData) => ({
              ...userData,
              save: jest.fn().mockResolvedValue(userData),
            })),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    jwtService = module.get(JwtService);
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      (userModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = { email, password: 'hashedPassword' };

      (userModel.findOne as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return a JWT token if login is successful', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const user = { _id: 'userId', email, password: 'hashedPassword' };
      const token = 'jwtToken';

      (userModel.findOne as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue(token);

      const result = await authService.login(email, password);

      expect(result).toEqual({ access_token: token });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: user.email, sub: user._id },
        { expiresIn: process.env.JWT_EXPIRY || '1h', secret: process.env.JWT_SECRET },
      );
    });
  });
});
