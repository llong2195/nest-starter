import { Request, Response } from 'express';

import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    console.log('Request...');
    next();
  }
}
