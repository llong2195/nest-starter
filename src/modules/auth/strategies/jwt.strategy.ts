import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

import { JWT_SECRET_KEY } from '@configs/config';

export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_SECRET_KEY,
        });
    }

    /**
     * It takes a payload, and returns a payload
     * @param {any} payload - The payload to validate.
     * @returns The payload is being returned.
     */
    async validate(payload: any) {
        return payload;
    }
}
