import {Controller, Request, Post, UseGuards, Body} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {ApiBody, ApiTags} from "@nestjs/swagger";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {AuthService} from "./auth.service";
import {UserEntity} from "../users/entities/user.entity";
import {LocalGuard} from "./guards/local.guard";

@Controller('auth')
@ApiTags('Auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) {}

    @UseGuards(LocalGuard)
    @Post('login')
    @ApiBody({type: CreateUserDto})
    async login(@Request() req) {
        return this.authService.login(req.user as UserEntity);
    }

    @Post('/register')
    register(@Body() dto: CreateUserDto) {
        return this.authService.register(dto)
    }
}