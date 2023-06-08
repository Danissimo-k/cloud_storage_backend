import {ApiProperty} from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({
        default: 'test@test.ru'
    })
    email: string

    @ApiProperty({
        default: 'Danil K'
    })
    fullName: string

    @ApiProperty({
        default: 'StrongPassword'
    })
    password: string
}
