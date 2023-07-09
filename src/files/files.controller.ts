import {Response} from 'express';
import {
    Controller,
    Delete,
    Get,
    MaxFileSizeValidator,
    ParseFilePipe,
    Post,
    Query,
    Res, StreamableFile,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {FilesService} from './files.service';
import {ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse, ApiTags} from "@nestjs/swagger";
import {FileInterceptor} from "@nestjs/platform-express";
import {fileStorage} from "./storage";
import {JwtGuard} from "../auth/guards/jwt.guard";
import {userIdDecorator} from "../auth/decorators/user-id.decorator";
import {FileType} from "./entities/file.entity";
import {ApiFileResponse} from "./decorators/api-file-response";


@Controller('files')
@ApiTags('files')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class FilesController {
    constructor(private readonly filesService: FilesService) {
    }


    @ApiFileResponse(
        'application/octet-stream',
    )
    @Get('/download')
    async getFile(
        @Query('ids') ids: string,
        @Res({passthrough: true}) response: Response
    ) {
        const idsArray = ids.split(',')
        if (idsArray.length > 1) {
            response.attachment('archive-name.zip');
            const files = await this.filesService.findAllByIds(idsArray);
            await this.filesService.compressFiles(files, response)
        } else {
            const file = await this.filesService.findOne(idsArray[0]);
            response.attachment(file.filename);
            return new StreamableFile(this.filesService.getFileStream(file.filename))
        }
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
