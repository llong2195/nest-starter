import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
    /**
     * @param {Request} req - Request - The incoming request object.
     * @param {Response} res - The response object.
     * @param {NextFunction} next - The next middleware function in the stack.
     */
    use(req: Request, res: Response, next: NextFunction) {
        console.log(req.headers, req.body);
    }
}
