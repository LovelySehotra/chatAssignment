import mongoose from 'mongoose';
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
  }


  // Mark messages in a conversation as read for a specific user


  async markAsRead(conversationId: string, messageId: string, currentUserId: string): Promise<void> {
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
  }
}
