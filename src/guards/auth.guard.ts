import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import * as dotenv from "dotenv";

dotenv.config();

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
     throw new UnauthorizedException("Invalid token")
    }

    try {
      console.log(process.env.JWT_SECRET)
      const decoded = this.jwtService.verify(token,{secret:process.env.JWT_SECRET});
      request.user = decoded; 
      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException("Invalid Token");
    }
  }
}
