import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import * as process from "process";
import {UsersService} from "../../users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly usersService: UsersService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.SECRET_KEY,
        });
    }

    async validate(payload: any) {
        console.log(payload)
        const user = await this.usersService.findById(payload.id)
        if (!user) {
            throw new UnauthorizedException("У вас нет прав доступа")
        }
        return {
            id: user.id
        }

    }
}