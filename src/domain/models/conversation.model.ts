import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export type ConversationType = 'direct' | 'group';
export interface IConversation extends Document {
  type: ConversationType;
  participants: mongoose.Types.ObjectId[];
  name?: string;          // group conversations only
  description?: string;   // group conversations only
  lastMessage?: {
    content: string;
    senderId: mongoose.Types.ObjectId;
    sentAt: Date;
  }|null;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
const conversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: ['direct', 'group'],
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    lastMessage: {
      content: String,
      senderId: { type: Schema.Types.ObjectId, ref: 'User' },
      sentAt: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
