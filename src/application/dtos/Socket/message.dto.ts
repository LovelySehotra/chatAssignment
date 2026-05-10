import { Expose, Transform } from "class-transformer";
import { IsString } from "class-validator";

export class CreateMessageDto {
    @IsString()
    conversationId!: string;

    @IsString()
    senderId!: string;

    @IsString()
    content!: string;

}
export class LastMessageDto {
    @IsString()
    content!: string;

    @IsString()
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