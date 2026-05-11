import mongoose, { Types } from 'mongoose';
import { IMessage, IConversation } from '@/domain/models';
import { IRepository } from '@/infrastructure';
import { AppError, NotFoundError, ForbiddenError, BadRequestError } from '@/interface/middleware/error/error';

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
    return await this.messageRepository.withTransaction(async (session) => {
      // Validate conversation exists
      const conversation = await this.conversationRepository.findById(conversationId, { session });
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
      }, { session });

      if (!message) {
        throw new AppError('Failed to create message', 500);
      }

      // Update conversation lastMessage
      const updatedConversation = await this.conversationRepository.updateById(conversationId, {
        lastMessage: {
          content: content,
          senderId: new mongoose.Types.ObjectId(senderId),
          sentAt: message.createdAt,
        },
      }, { session });

      if (!updatedConversation) {
        throw new AppError('Failed to update conversation', 500);
      }

      const populatedMessage = await this.messageRepository.findById(String(message._id), {
        session,
        populate: {
          path: 'senderId',
          select: '_id username email avatar',
        },
      });

      if (!populatedMessage) {
        throw new AppError('Failed to populate message', 500);
      }

      return populatedMessage;
    });
  }


  // Mark messages in a conversation as read for a specific user


  async markAsRead(conversationId: string, messageId: string, currentUserId: string): Promise<void> {
    await this.messageRepository.withTransaction(async (session) => {
      const conversation = await this.conversationRepository.findById(conversationId, { session });
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

      const readAt = new Date();
      await this.messageRepository.updateOne(
        {
          _id: messageId,
          'readBy.userId': { $ne: new mongoose.Types.ObjectId(currentUserId) }
        },
        {
          $push: { readBy: { userId: new mongoose.Types.ObjectId(currentUserId), readAt } }
        },
        { session }
      );
    });
  }
  async getMessagesByConversationId(
    conversationId: string,
    userId: string,
    paginationOptions: { cursor?: string; limit: number },
  ): Promise<{
    data: IMessage[];
    pagination: { cursor: string | null; limit: number };
  }> {

    if (!Types.ObjectId.isValid(conversationId)) {
      throw new BadRequestError('Invalid conversation id');
    }

    const conversation =
      await this.conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    const isParticipant = conversation.participantIds.some(
      (p) => p.toString() === userId,
    );

    if (!isParticipant) {
      throw new ForbiddenError(
        'User is not a participant in this conversation',
      );
    }

    const limit = Math.min(paginationOptions.limit ?? 20, 50);

    const query: any = {
      conversationId: new Types.ObjectId(conversationId),
    };

    if (
      paginationOptions.cursor &&
      Types.ObjectId.isValid(paginationOptions.cursor)
    ) {
      query._id = {
        $lt: new Types.ObjectId(paginationOptions.cursor),
      };
    }

    const messages = await this.messageRepository.findMany(query, {
      sort: { _id: -1 },
      limit: limit + 1,
    });

    if (messages.length === 0) {
      return {
        data: [],
        pagination: {
          cursor: null,
          limit,
        },
      };
    }

    const hasNextPage = messages.length > limit;

    if (hasNextPage) {
      messages.pop();
    }

    return {
      data: messages,
      pagination: {
        cursor: hasNextPage
          ? String(messages[messages.length - 1]._id)
          : null,
        limit,
      },
    };
  }
  async getUnreadMessagesCount(userId: string, conversationId: string): Promise<number> {
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
