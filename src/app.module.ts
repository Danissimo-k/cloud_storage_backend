import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {UsersModule} from './users/users.module';
import {FilesModule} from './files/files.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule} from "@nestjs/config";
import {UserEntity} from "./users/entities/user.entity";
import {FileEntity} from "./files/entities/file.entity";
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        UsersModule,
        FilesModule,
        ConfigModule.forRoot({
            isGlobal: true
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.HOST,
            port: Number(process.env.PORT),
            username: process.env.DB_USER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE,
            entities: [UserEntity, FileEntity],
            synchronize: true,
        }),
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
