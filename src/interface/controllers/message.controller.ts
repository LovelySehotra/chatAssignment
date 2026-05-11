import { MessageService } from "@/application/services/Socket";
import { getSocketIO } from "@/config";
import { Request, Response } from 'express';

export class MessageController {
    private messageService: MessageService;
    constructor(messageService: MessageService) {
        this.messageService = messageService;
    }

    sendMessage = async (req: Request, res: Response) => {
        const userId = req.user!._id;
        const { conversationId, content } = req.body;

        const message = await this.messageService.sendMessage(String(userId), conversationId, content);
        if (!message) {
            return res.status(500).json({ message: 'Failed to send message' });
        }
        const io = getSocketIO();
        io.to(conversationId).emit('receive_message', message);

        return res.status(201).json(message);
    }

    markAsRead = async (req: Request, res: Response) => {
        const userId = req.user!._id;
        const { conversationId, messageId } = req.body;

        await this.messageService.markAsRead(conversationId, messageId, String(userId));

        return res.status(200).json({ message: 'Messages marked as read' });
    }

    getMessagesByConversationId = async (req: Request, res: Response) => {
        const userId = req.user!._id;
        const { conversationId } = req.params;
        const { cursor, limit } = req.query;

        const paginationOptions = {
            cursor: String(cursor) || '',
            limit: Number(limit) || 20,
        };

        const result = await this.messageService.getMessagesByConversationId(String(conversationId), String(userId), paginationOptions);

        return res.status(200).json(result);
    }

    getUnreadMessagesCount = async (req: Request, res: Response) => {
        const userId = req.user!._id;
        const { conversationId } = req.params;

        const count = await this.messageService.getUnreadMessagesCount(String(userId), String(conversationId));

        return res.status(200).json({ unreadCount: count });
    }
}