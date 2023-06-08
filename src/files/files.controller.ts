import {
    Controller, Delete,
    Get,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {FilesService} from './files.service';
import {ApiBearerAuth, ApiBody, ApiConsumes, ApiTags} from "@nestjs/swagger";
import {FileInterceptor} from "@nestjs/platform-express";
import {fileStorage} from "./storage";
import {JwtGuard} from "../auth/guards/jwt.guard";
import {userIdDecorator} from "../auth/decorators/user-id.decorator";
import {FileType} from "./entities/file.entity";


@Controller('files')
@ApiTags('files')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class FilesController {
    constructor(private readonly filesService: FilesService) {
    }

    @Get()
    findAll(
        @userIdDecorator() userId: string, @Query('type') fileType: FileType
    ) {
        return this.filesService.findAll(userId, fileType)
    }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: fileStorage,
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                }
            }
        }
    })
    create(@UploadedFile(
               new ParseFilePipe({
                   validators: [
                       new MaxFileSizeValidator({maxSize: 1024 * 1024 * 5})
                   ]
               })
           ) file: Express.Multer.File,
           @userIdDecorator() userId: string
    ) {
        return this.filesService.create(file, userId);
    }

    @Delete()
    remove(@userIdDecorator() userId: string, @Query('ids') ids: string) {
        return this.filesService.remove(userId, ids)
    }

}
