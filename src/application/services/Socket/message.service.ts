import mongoose, { Types } from 'mongoose';
import { IMessage, IConversation } from '@/domain/models';
import { IRepository } from '@/infrastructure';
import { AppError } from '@/interface/middleware/error/error';

export class MessageService {
  private messageRepository: IRepository<IMessage>;
  private conversationRepository: IRepository<IConversation>;

  constructor(
    messageRepository: IRepository<IMessage>,
    conversationRepository: IRepository<IConversation>
  ) {
    this.messageRepository = messageRepository;
    this.conversationRepository = conversationRepository;
  }


  // Save a new message and update the conversation's last message.

  async sendMessage(senderId: string, conversationId: string, content: string): Promise<IMessage> {
    try {
      console.log("before creating message")
      // Validate conversation exists
      const conversation = await this.conversationRepository.findById(conversationId);
      if (!conversation) {
        throw new AppError('Conversation not found', 404);
      }

      // Verify sender is participant
      const isParticipant = conversation.participants.some(
        (p) => p.toString() === senderId
      );

      if (!isParticipant) {
        throw new AppError('User is not a participant in this conversation', 403);
      }

      // Create message
      const message = await this.messageRepository.create({
        conversationId: new mongoose.Types.ObjectId(conversationId),
        senderId: new mongoose.Types.ObjectId(senderId),
        content,
        type: 'text',
        readBy: [],
      });

      // Update conversation lastMessage
      await this.conversationRepository.updateById(conversationId, {
        lastMessage: {
          content: content,
          senderId: new mongoose.Types.ObjectId(senderId),
          sentAt: message.createdAt,
        },
      });


      const populatedMessage = await this.messageRepository.findById(message.id, {
        populate: {
          path: 'sender',
          select: '_id username email avatar',
        },
      });

      if (!populatedMessage) {
        throw new AppError('Failed to populate message', 500);
      }

      return populatedMessage;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message || 'Failed to send message', 500);
    }
  }


  // Mark messages in a conversation as read for a specific user


  async markAsRead(conversationId: string, messageId: string, currentUserId: string): Promise<void> {
    try {
      const conversation = await this.conversationRepository.findById(conversationId);
      if (!conversation) {
        throw new AppError('Conversation not found', 404);
      }

      // Ensure user is participant
      const isParticipant = conversation.participants.some(
        (p) => p.toString() === currentUserId
      );
      if (!isParticipant) {
        throw new AppError('User is not a participant in this conversation', 403);
      }
      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        throw new AppError('Message not found', 404);
      }
      const alreadyRead = message.readBy.some(
        (r) => r.userId.toString() === currentUserId
      );
      if (alreadyRead) {
        return; // No action needed 
      }
      const readAt = new Date();
      message.readBy.push({ userId: new mongoose.Types.ObjectId(currentUserId), readAt });
      await message.save();
      return;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message || 'Failed to mark message as read', 500);
    }
  }
  async getMessagesByConversationId(conversationId: string, userId: string, paginationOptions: { cursor: string, limit: number,  }): Promise<{
    data: IMessage[];
    pagination: { nextCursor: string | null; limit: number };
  }> {
    try {
      const conversation = await this.conversationRepository.findById(conversationId);
      if (!conversation) {
        throw new AppError('Conversation not found', 404);
      }
      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId
      );
      if (!isParticipant) {
        throw new AppError('User is not a participant in this conversation', 403);
      }
      const limit = Math.min(paginationOptions.limit ?? 20, 50);
      let query: any = { conversationId };
      if (paginationOptions.cursor) {
        query._id = { $lt: new Types.ObjectId(paginationOptions.cursor) };
      }
      console.log("Querying messages with:", query, "Limit:", limit);

      const messages = await this.messageRepository.findMany(query, {
        sort: { _id: -1 },
        limit: limit + 1,
      });
      const nextCursor =
        messages.length > limit
          ? String(messages[messages.length - 1]._id)
          : null;
      if (messages.length > limit) messages.pop();
      return {
        data: messages,
        pagination: { limit, nextCursor },
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message || 'Failed to retrieve messages', 500);
    }
  }
  async getUnreadMessagesCount(userId: string,conversationId:string): Promise<number> {
    
    try {
         const conversation = await this.conversationRepository.findById(conversationId);
      if (!conversation) {
        throw new AppError('Conversation not found', 404);
      }
      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId
      );
      if (!isParticipant) {
        throw new AppError('User is not a participant in this conversation', 403);
      }
      const count = await this.messageRepository.count({
        conversationId,
        readBy: { $not: { $elemMatch: { userId: new mongoose.Types.ObjectId(userId) } } },
      });
      return count;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(error.message || 'Failed to count unread messages', 500);
    }
  }
}
