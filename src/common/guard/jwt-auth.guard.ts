import { Request } from 'express';

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { IS_PUBLIC_KEY } from '../decorators';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const isSkippedAuth = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isSkippedAuth) return true;

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Unauthorized: token not found!');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ [key: string]: any }>(
        token,
      );
      Object.defineProperty(request, 'adminUser', payload);
    } catch (error) {
      throw new UnauthorizedException('Unauthorized', { cause: error });
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
