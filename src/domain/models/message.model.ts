import mongoose, { Document, Schema, Types } from 'mongoose';
import { IUser } from './user.model';
import { IConversation } from './conversation.model';

export interface IReadReceipt {
  userId: Types.ObjectId;
  readAt: Date;
}
export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  type: 'text';
  readBy: IReadReceipt[];
  createdAt: Date;
  updatedAt: Date;
}
const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    type: {
      type: String,
      enum: ['text'],
      default: 'text',
    },
    readBy: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        readAt: { type: Date, required: true },
        _id: false,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

export const Message = mongoose.model<IMessage>('Message', messageSchema);
