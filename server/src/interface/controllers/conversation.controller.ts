import { ConversationService } from "@/application/services/Socket/conversation.service";
import { Request, Response } from 'express';
import { BadRequestError, NotFoundError, ForbiddenError } from "../middleware/error/error";

export class ConversationController {
    private conversationService: ConversationService
    constructor(conversationService: ConversationService) {
        this.conversationService = conversationService;
    }

    createDirectConversation = async (req: Request, res: Response) => {
        const userId = req.user!._id;
        const { type, participantIds } = req.body;
        
        if (type !== 'direct') throw new BadRequestError('Invalid conversation type');
        if (!participantIds || !participantIds[0]) throw new BadRequestError('Participant ID is required');

        const conversation = await this.conversationService.createDirectConversation([String(userId), participantIds[0]]);
        return res.status(201).json(conversation);
    }

    createGroupConversation = async (req: Request, res: Response) => {
        const userId = req.user!._id;
        const { participantIds, name, description, type } = req.body;
        
        if (type !== 'group') throw new BadRequestError('Invalid conversation type');
        
        const conversation = await this.conversationService.createGroupConversation([String(userId), ...participantIds], name, description);
        return res.status(201).json(conversation);
    }

    getUserConversations = async (req: Request, res: Response) => {
        const userId = req.user!._id;
        const conversations = await this.conversationService.getUserConversations(String(userId));
        return res.status(200).json(conversations);
    }

    getConversationById = async (req: Request, res: Response) => {
        const userId = req.user!._id;
        const { conversationId } = req.params;
        
        const conversation = await this.conversationService.getConversationById(String(conversationId));
        if (!conversation) throw new NotFoundError('Conversation not found');
        
        // Check if user is a participant
        const isParticipant = conversation.participantIds.some(
            participant => participant.toString() === String(userId)
        );

        if (!isParticipant) {
            throw new ForbiddenError('You are not a participant in this conversation');
        }

        return res.status(200).json(conversation);
    }
}