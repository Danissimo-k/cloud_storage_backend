import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {FileEntity, FileType} from "./entities/file.entity";
import {Repository} from "typeorm";



@Injectable()
export class FilesService {

    constructor(
        @InjectRepository(FileEntity)
        private repository: Repository<FileEntity>
    ) {
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
