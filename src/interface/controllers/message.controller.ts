import { MessageService } from "@/application/services/Socket";
import { getSocketIO } from "@/config";

export class MessageController {
    private messageService: MessageService;
    constructor(messageService: MessageService) {
        this.messageService = messageService;
    }
    sendMessage = async (req: any, res: any) => {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const { conversationId, content } = req.body;
        try {
            const message = await this.messageService.sendMessage(String(userId), conversationId, content);
            const io = getSocketIO();
            io.to(conversationId).emit('receive_message', message.toJSON());
            return res.status(201).json(message);
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }
    markAsRead = async (req: any, res: any) => {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const { conversationId, messageId } = req.body;
        try {
            await this.messageService.markAsRead(conversationId, messageId, String(userId));
            return res.status(200).json({ message: 'Messages marked as read' });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }
    getMessagesByConversationId = async (req: any, res: any) => {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const { conversationId } = req.params;
        const { cursor, limit } = req.query;
        try {
            const paginationOptions = {
                cursor: String(cursor) || '',
                limit: Number(limit) || 20,
            };
            const result = await this.messageService.getMessagesByConversationId(conversationId, String(userId), paginationOptions);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }
    getUnreadMessagesCount = async (req: any, res: any) => {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const { conversationId } = req.params;
        try {
            const count = await this.messageService.getUnreadMessagesCount(String(userId), conversationId);
            return res.status(200).json({ unreadCount: count });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }
}