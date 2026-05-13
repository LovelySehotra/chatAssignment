import axiosClient from './axiosClient';

export interface Conversation {
  _id: string;
  type: 'direct' | 'group';
  participants: string[];
  name?: string;
  description?: string;
  lastMessage?: {
    content: string;
    senderId: string;
    sentAt: string;
  } | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDirectPayload {
  type: 'direct';
  participantIds: any[];

}

export interface CreateGroupPayload {
  type: 'group';
  participantIds: any[];
  name: string;
  description?: string;
}

export const conversationApi = {
  createDirect: (data: CreateDirectPayload) =>
    axiosClient.post<Conversation>('/conversations/direct', data),

  createGroup: (data: CreateGroupPayload) =>
    axiosClient.post<Conversation>('/conversations/group', data),

  getAll: () =>
    axiosClient.get<Conversation[]>('/conversations'),

  getById: (id: string) =>
    axiosClient.get<Conversation>(`/conversations/${id}`),
};
