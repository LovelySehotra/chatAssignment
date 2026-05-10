import { Server, Socket } from 'socket.io';
import { MessageService } from '@/application/services/Socket';
import { RepositoryFactory } from '@/infrastructure';
import { Message, Conversation, IMessage, IConversation } from '@/domain/models';
import { sendMessageSchema, markReadSchema } from '@/interface/middleware/dtos/socket.validation';

// Initialize the message service
const messageRepository = RepositoryFactory.createFull<IMessage>(Message);
const conversationRepository = RepositoryFactory.createFull<IConversation>(Conversation);
const messageService = new MessageService(
  messageRepository,
  conversationRepository
);

export const registerMessageHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.userId;

  // Join a specific conversation room
  socket.on('join_conversation', (data: { conversationId: string }) => {
    socket.join(data.conversationId);
  });

  // Leave a specific conversation room
  socket.on('leave_conversation', (data: { conversationId: string }) => {
    socket.leave(data.conversationId);
  });

  // Handle sending a message
  socket.on('send_message', async (payload: unknown, callback: (response: any) => void) => {
    try {
      const { conversationId, content } = sendMessageSchema.parse(payload);
      
      const message = await messageService.sendMessage(userId, conversationId, content);
      console.log('Message sent:', message);
      // Broadcast to the conversation room (excluding sender)
      socket.to(conversationId).emit('receive_message', message);

      if (callback) {
        callback({ status: 'success', data: message });
      }
    } catch (error: any) {
      if (callback) {
        callback({ status: 'error', error: error.message });
      }
    }
  });

  // Handle marking messages in a conversation as read
  socket.on('mark_read', async (payload: unknown, callback: (response: any) => void) => {
    try {
      const { conversationId,messageId } = markReadSchema.parse(payload);
      
      await messageService.markAsRead(conversationId, messageId,userId);

      // Broadcast to other participants that messages were read
      socket.to(conversationId).emit('messages_read', {
        conversationId,
        readBy: userId,
      });

      if (callback) {
        callback({ status: 'success' });
      }
    } catch (error: any) {
      if (callback) {
        callback({ status: 'error', error: error.message });
      }
    }
  });
};
