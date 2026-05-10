import mongoose, { Types } from 'mongoose';
import { IMessage, IConversation } from '@/domain/models';
import { IRepository } from '@/infrastructure';
import { AppError, NotFoundError, ForbiddenError } from '@/interface/middleware/error/error';

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
    console.log("before creating message")
    // Validate conversation exists
    const conversation = await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    // Verify sender is participant
    const isParticipant = conversation.participantIds.some(
      (p) => p.toString() === senderId
    );

    if (!isParticipant) {
      throw new ForbiddenError('User is not a participant in this conversation');
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
  }


  // Mark messages in a conversation as read for a specific user


  async markAsRead(conversationId: string, messageId: string, currentUserId: string): Promise<void> {
    const conversation = await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    // Ensure user is participant
    const isParticipant = conversation.participantIds.some(
      (p) => p.toString() === currentUserId
    );
    if (!isParticipant) {
      throw new ForbiddenError('User is not a participant in this conversation');
    }
    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw new NotFoundError('Message not found');
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
  }
  async getMessagesByConversationId(conversationId: string, userId: string, paginationOptions: { cursor: string, limit: number,  }): Promise<{
    data: IMessage[];
    pagination: { nextCursor: string | null; limit: number };
  }> {
    const conversation = await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }
    const isParticipant = conversation.participantIds.some(
      (p) => p.toString() === userId
    );
    if (!isParticipant) {
      throw new ForbiddenError('User is not a participant in this conversation');
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
  }
  async getUnreadMessagesCount(userId: string,conversationId:string): Promise<number> {
    const conversation = await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }
    const isParticipant = conversation.participantIds.some(
      (p) => p.toString() === userId
    );
    if (!isParticipant) {
      throw new ForbiddenError('User is not a participant in this conversation');
    }
    const count = await this.messageRepository.count({
      conversationId,
      readBy: { $not: { $elemMatch: { userId: new mongoose.Types.ObjectId(userId) } } },
    });
    return count;
  }
}
