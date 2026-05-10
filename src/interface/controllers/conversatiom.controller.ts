import { ConversationService } from "@/application/services/Socket/conversation.service";

export class ConversationController {
    private conversationService: ConversationService
    constructor(conversationService: ConversationService) {
        this.conversationService = conversationService;
    }
    createDirectConversation = async (req: any, res: any) => {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const { type } = req.body;
        if (type !== 'direct') return res.status(400).json({ message: 'Invalid conversation type' });
        const conversation = await this.conversationService.createDirectConversation([String(userId), req.body.participantIds[0]]);
        return res.status(201).json(conversation);
    }
    createGroupConversation = async (req: any, res: any) => {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const { participantIds, name, description, type } = req.body;
        if (type !== 'group') return res.status(400).json({ message: 'Invalid conversation type' });
        const conversation = await this.conversationService.createGroupConversation([String(userId), ...participantIds], name, description);
        return res.status(201).json(conversation);
    }
    getUserConversations = async (req: any, res: any) => {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const conversations = await this.conversationService.getUserConversations(String(userId));
        return res.status(200).json(conversations);
    }
    getConversationById = async (req: any, res: any) => {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const { conversationId } = req.params;
        const conversation = await this.conversationService.getConversationById(conversationId);
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
        // Check if user is a participant
        if (!conversation.participantIds.some(participant => participant.toString() === String(userId))) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        return res.status(200).json(conversation);
    }
}