import {Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {UserEntity} from "../../users/entities/user.entity";

export enum FileType {
    OTHERS = 'other',
    TRASH = 'trash',
}

@Entity('files')
export class FileEntity {
    @PrimaryGeneratedColumn("uuid")
    id:string

    @Column()
    filename: string

    @Column()
    size: number

    @Column()
    mimetype: string

    @DeleteDateColumn()
    deletedAt?: Date

    @ManyToOne(() => UserEntity, user => user.files)
    user: UserEntity
}

