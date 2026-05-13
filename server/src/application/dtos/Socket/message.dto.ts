import { Expose, Transform } from "class-transformer";
import { IsMongoId, IsString } from "class-validator";

export class CreateMessageDto {
    @IsMongoId()
    @Transform(({ value }) => value?.trim())
    conversationId!: string;
    @IsString()
    content!: string;

}
export class LastMessageDto {
    @IsString()
    content!: string;

    @IsMongoId()
    @Transform(({ value }) => value?.trim())
    senderId!: string;

    @IsString()
    sentAt!: string;
}
export class MessageResponseDto {
    @Expose()
    @Transform(({ value }) => value?.toString?.() ?? value)
    _id!: string;
    @Expose()
    conversationId!: string;
    @Expose()
    senderId!: string;
    @Expose()
    content!: string;
    @Expose()
    type!: 'text';
    @Expose()
    readBy!: {
        userId: string;
        readAt: Date;
    }[];
    @Expose()
    createdAt!: Date;
    @Expose()
    updatedAt!: Date;
}