import { Response } from "express";
import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {FileEntity, FileType} from "./entities/file.entity";
import {In, Repository} from "typeorm";
import {createReadStream, ReadStream} from 'fs'
import {join} from "path";
import * as process from "process";
import * as archiver from 'archiver';

@Injectable()
export class FilesService {

    constructor(
        @InjectRepository(FileEntity)
        private repository: Repository<FileEntity>
    ) {
    }

    getFileStream(fileName: string): ReadStream {
        return createReadStream(join(process.cwd(), 'uploads', fileName))
    }

    async compressFiles(files: FileEntity[], response: Response){
        const zip = archiver('zip', {zlib: { level: 9 }})
        zip.pipe(response)
        files.forEach(file => {
            zip.append(this.getFileStream(file.filename), {name: file.filename})
        })
        await zip.finalize();
    }

    async findAllByIds(ids: string[]): Promise<FileEntity[]> {
        const files = await this.repository.find({
            where: {
                id: In(ids)
            }
        })
        if (!files.length) {
            throw new NotFoundException("Files not found")
        }

        return files
    }

    async findOne(id: string): Promise<FileEntity> {

        const file = await this.repository.findOneBy({
            id
        })

        if (!file) {
            throw new NotFoundException("File not found")
        }
        return file
    }

    findAll(userId: string, fileType: FileType) {
        const qb = this.repository.createQueryBuilder('file')

        qb.where('file.userId = :userId', {userId})

        if (fileType === FileType.TRASH) {
            qb
                .withDeleted()
                .andWhere('file.deletedAt IS NOT NULL')
        }

        return qb.getMany();
    }

    create(file: Express.Multer.File, userId: string) {
        return this.repository.save({
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            user: {id: userId}
        })
    }

    remove(userId: string, ids: string) {
        const idsArray = ids.split(',')

        const qb = this.repository.createQueryBuilder('file')

        qb.where('id IN (:...ids) and userId = :userId', {
            ids: idsArray,
            userId,
        })

        return qb.softDelete().execute()
    }

}
