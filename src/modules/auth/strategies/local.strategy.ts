import { Strategy } from 'passport-local';

import { UserEntity } from '@entities/user.entity';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'email',
            passwordField: 'password',
        });
    }

    /**
     * The validate function takes in an email and password, and returns a promise of a UserEntity
     * @param {string} email - string - The email of the user
     * @param {string} password - The password that the user entered.
     * @returns A promise of a UserEntity
     */
    validate(email: string, password: string): Promise<UserEntity> {
        return this.authService.validateUser(email, password);
    }
}
