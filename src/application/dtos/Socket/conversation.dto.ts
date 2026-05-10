import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsArray,
  ArrayMinSize,
  ArrayUnique,
  MaxLength,
  ValidateNested,
  IsMongoId,
  IsDate,
} from 'class-validator';

import { Transform, Type, Expose } from 'class-transformer';
import { ConversationType } from '@/domain/models';

export class LastMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  content!: string;

  @IsMongoId()
  senderId!: string;

  @Type(() => Date)
  @IsDate()
  sentAt!: Date;
}



export class CreateConversationDto {
  @IsString()
  @IsIn(['direct', 'group'])
  type!: ConversationType;

  @IsArray()
  @ArrayMinSize(2, {
    message: 'Conversation must contain at least 2 participants',
  })
  @ArrayUnique()
  @IsMongoId({ each: true })
  participants!: string[];

  // Group only
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsMongoId()
  createdBy!: string;
}

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  participants?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => LastMessageDto)
  lastMessage?: LastMessageDto | null;
}

export class ConversationResponseDto {
  @Expose()
  @Transform(({ value }) => value?.toString?.() ?? value)
  _id!: string;

  @Expose()
  type!: ConversationType;

  @Expose()
  @Transform(({ value }) =>
    value?.map((id: any) => id?.toString?.() ?? id),
  )
  participants!: string[];

  @Expose()
  name?: string;

  @Expose()
  description?: string;

  @Expose()
  lastMessage?: {
    content: string;
    senderId: string;
    sentAt: Date;
  } | null;

  @Expose()
  @Transform(({ value }) => value?.toString?.() ?? value)
  createdBy!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}




