import { IConversation } from "@/domain/models";
import { IRepository } from "@/infrastructure";
import mongoose from "mongoose";

export class ConversationService {
    private conversationRepository: IRepository<IConversation>;
    constructor(conversationRepository: IRepository<IConversation>) {
        this.conversationRepository = conversationRepository;
    }
    async createDirectConversation(userId: string, participantId: string): Promise<IConversation> {
        // conversation already exists between these two users
        const existingConversation = await this.conversationRepository.findOne({
            type: 'direct',
            participants: { $all: [userId, participantId], $size: 2 },
        });
        if (existingConversation) {
            return existingConversation;
        }
        const newConversation = await this.conversationRepository.create({
            participants: [new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(participantId)],
            lastMessage: null,
        });
        return newConversation;

    }
    async createGroupConversation(userId: string, participantIds: string[], name?: string, description?: string): Promise<IConversation> {
        const newConversation = await this.conversationRepository.create({
            type: 'group',
            participants: [new mongoose.Types.ObjectId(userId), ...participantIds.map(id => new mongoose.Types.ObjectId(id))],
            name,
            description,
            lastMessage: null,
        });
        return newConversation;
    }
    async getUserConversations(userId: string): Promise<IConversation[]> {
        return this.conversationRepository.findMany({
            participants: userId,
        })
    }
    async getConversationById(conversationId: string): Promise<IConversation | null> {
        return this.conversationRepository.findById(conversationId);
    }

}