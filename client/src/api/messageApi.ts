import axiosClient from './axiosClient';

export interface Message {
  _id: string;
  conversationId: string;
  senderId: any;
  content: string;
  type: 'text';
  readBy: { userId: string; readAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
}

export interface MarkReadPayload {
  conversationId: string;
  messageId: string;
}

export interface MessagesPaginated {
  data: Message[];
  pagination: {
    nextCursor: string | null;
    limit: number;
  };
}

export const messageApi = {
  send: (data: SendMessagePayload) =>
    axiosClient.post<Message>('/messages/send', data),

  markRead: (data: MarkReadPayload) =>
    axiosClient.post('/messages/mark-read', data),

  getByConversation: (conversationId: string, cursor?: string, limit?: number) =>
    axiosClient.get<MessagesPaginated>(`/messages/${conversationId}`, {
      params: { cursor, limit },
    }),

  getUnreadCount: (conversationId: string) =>
    axiosClient.get<{ unreadCount: number }>(`/messages/${conversationId}/unread-count`),
};
