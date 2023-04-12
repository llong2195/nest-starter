import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { CurrentUserDto } from '@base/base.dto';
import { ErrorMessageCode } from '@constants/error-message-code';
import { UserEntity } from '@entities/user.entity';
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { LoginRequestDto } from './dto/login-request.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly configService: ConfigService, // private readonly nodemailerService: NodemailerService,
    ) {}
    /**
     * It takes an email and password, finds the user in the database, compares the password, and
     * returns the user if the password is correct
     * @param {string} email - string, password: string
     * @param {string} password - The password that the user entered in the login form.
     * @returns The user object is being returned.
     */
    async validateUser(email: string, password: string): Promise<UserEntity | undefined> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException(ErrorMessageCode.AUTH_LOGIN_FAIL);
        }
        const compareResult = await bcrypt.compare(password, user.password);
        if (!compareResult) {
            throw new UnauthorizedException(ErrorMessageCode.AUTH_LOGIN_FAIL);
        }
        return user;
    }

    /**
     * It takes a LoginRequestDto, finds a user by email, compares the password, and returns a token
     * @param {LoginRequestDto} request - LoginRequestDto: This is the request object that will be sent
     * to the server.
     * @returns user and token
     */
    async login(request: LoginRequestDto): Promise<any> {
        const user = await this.userService.findByEmail(request.email);
        if (!user) {
            throw new UnauthorizedException(ErrorMessageCode.AUTH_LOGIN_FAIL);
        }
        const compareResult = await bcrypt.compare(request.password, user.password);
        if (!compareResult) {
            throw new UnauthorizedException(ErrorMessageCode.AUTH_LOGIN_FAIL);
        }
        if (!user.isActive) {
            throw new UnauthorizedException(ErrorMessageCode.AUTH_DISABLED_ACCOUNT);
        }
        if (user.deleted) {
            throw new HttpException(ErrorMessageCode.AUTH_DELETED_ACCOUNT, HttpStatus.BAD_REQUEST);
        }
        const payload: CurrentUserDto = {
            email: user.email,
            id: user.id,
            role: user.role,
        };
        const token = await this.createToken(payload);
        return { ...user, token };
    }

    /**
     * It takes a payload, which is an object of type CurrentUserDto, and returns a token
     * @param {CurrentUserDto} payload - The data to be encrypted.
     * @returns A JWT token
     */
    async createToken(payload: CurrentUserDto) {
        return await this.jwtService.signAsync(payload);
    }

    /**
     * It takes a token, verifies it, and then returns the user that is associated with the token
     * @param {string} token - The token that was sent in the request.
     * @returns The user object
     */
    public async getUserFromAuthenticationToken(token: string): Promise<UserEntity> {
        const payload: any = this.jwtService.verify(token, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        });
        if (payload.id) {
            return this.userService.findById(payload.id);
        }
    }

    /**
     * This function takes a payload and signOptions as arguments and returns a Promise that resolves
     * to a string.
     * @param payload - The data you want to sign.
     * @param signOptions - jwt.SignOptions = {}
     * @returns A string
     */
    async generateToken(payload: Record<string, unknown>, signOptions: jwt.SignOptions = {}): Promise<string> {
        return this.jwtService.sign(payload, signOptions);
    }

    /**
     * This function decodes a token and returns a promise that resolves to either null, a string, or
     * an object.
     * @param {string} token - string - The token to decode.
     * @param decodeOptions - jwt.DecodeOptions = {}
     * @returns The return type is a Promise of a null, string, or object.
     */
    async decodeToken(
        token: string,
        decodeOptions: jwt.DecodeOptions = {},
    ): Promise<null | string | { [key: string]: unknown }> {
        return this.jwtService.decode(token, decodeOptions);
    }

    /**
     * This function verifies a token and returns a promise that resolves to a record of unknowns.
     * @param {string} token - The token to verify.
     * @param {JwtVerifyOptions} verifyOptions - JwtVerifyOptions = {}
     * @returns A promise that resolves to a record of unknowns.
     */
    async verifyToken(token: string, verifyOptions: JwtVerifyOptions = {}): Promise<Record<string, unknown>> {
        return this.jwtService.verifyAsync(token, verifyOptions);
    }
}
