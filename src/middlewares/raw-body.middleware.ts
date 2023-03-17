import * as bodyParser from 'body-parser';
import { NextFunction, Request, Response } from 'express';

import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
    /**
     * The function takes a request, response, and next function as parameters. It then uses the
     * bodyParser.raw() function to parse the request body
     * @param {Request} req - Request - The incoming request object.
     * @param {Response} res - The response object.
     * @param {NextFunction} next - The next middleware function in the stack.
     */
    use(req: Request, res: Response, next: NextFunction) {
        bodyParser.raw({ type: '*/*' })(req, res, next);
    }
}
