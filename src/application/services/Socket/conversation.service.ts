import { IConversation } from "@/domain/models";
import { IRepository } from "@/infrastructure";
import mongoose from "mongoose";

export class ConversationService {
    private conversationRepository: IRepository<IConversation>;
    constructor(conversationRepository: IRepository<IConversation>) {
        this.conversationRepository = conversationRepository;
    }
    async createDirectConversation(participantIds: string[]): Promise<IConversation> {
        // conversation already exists between these two users
        const existingConversation = await this.conversationRepository.findOne({
            type: 'direct',
            participantIds: { $all: participantIds, $size: 2 },
        });
        if (existingConversation) {
            return existingConversation;
        }
        const newConversation = await this.conversationRepository.create({
            type: 'direct',
            participantIds: participantIds.map(id => new mongoose.Types.ObjectId(id)),
            createdBy: new mongoose.Types.ObjectId(participantIds[0]),
            lastMessage: null,
        });
        return newConversation;

    }
    async createGroupConversation(participantIds: string[], name?: string, description?: string): Promise<IConversation> {
        const newConversation = await this.conversationRepository.create({
            type: 'group',
            participantIds: [...participantIds.map(id => new mongoose.Types.ObjectId(id))],
            name,
            description,
            createdBy: new mongoose.Types.ObjectId(participantIds[0]),
            lastMessage: null,
        });
        return newConversation;
    }
    async getUserConversations(userId: string): Promise<IConversation[]> {
        return this.conversationRepository.findMany({
            participantIds: userId,
        })
    }
    async getConversationById(conversationId: string): Promise<IConversation | null> {
        return this.conversationRepository.findById(conversationId);
    }

}