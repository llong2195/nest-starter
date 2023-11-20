import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JWT_SECRET_KEY } from '@configs/config';

export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
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
