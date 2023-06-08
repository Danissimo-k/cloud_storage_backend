import {ForbiddenException, Injectable} from '@nestjs/common';
import {UsersService} from "../users/users.service";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {UserEntity} from "../users/entities/user.entity";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {
    }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email)

        if (user && user.password === password) {
            const {password, ...result} = user
            return result
        }

        return null
    }

    async register(dto: CreateUserDto) {
        try {
            const user = await this.usersService.create(dto)
            const payload = {
                id: user.id,
                password: user.password,
                email: user.email,
                fullName: user.fullName,
            }
            return {
                token: this.jwtService.sign(payload)
            }
        } catch (error) {
            console.log(error)
            throw new ForbiddenException("Registration error")
        }
    }

    async login(user: UserEntity) {
        const payload = {
            id: user.id,
            password: user.password,
            email: user.email,
            fullName: user.fullName,
        }

        return {
            token: this.jwtService.sign(payload)
        }
    }

}
