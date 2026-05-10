import { Router } from "express";
import { MessageController } from "../controllers/message.controller";
import { MessageService } from "@/application/services/Socket";
import { Conversation, Message } from "@/domain/models";
import { RepositoryFactory } from "@/infrastructure/repository/GenericRepository";
import { IsAuthenticated } from "../middleware/auth/authGuard";
import { UseRequestDto, UseResponseDto } from "../middleware/dtos/validation";
import { CreateMessageDto, MessageResponseDto } from "@/application/dtos/Socket/message.dto";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();

const messageRepository = RepositoryFactory.createFull(Message);
const conversationRepository = RepositoryFactory.createFull(Conversation);
const messageService = new MessageService(messageRepository, conversationRepository);
const messageController = new MessageController(messageService);

router.use(IsAuthenticated);

router.post(
    '/send',
    UseRequestDto(CreateMessageDto),
    UseResponseDto(MessageResponseDto),
    asyncHandler(messageController.sendMessage)
);

router.post(
    '/mark-read',
    asyncHandler(messageController.markAsRead)
);

router.get(
    '/:conversationId',
    UseResponseDto(MessageResponseDto),
    asyncHandler(messageController.getMessagesByConversationId)
);

router.get(
    '/:conversationId/unread-count',
    asyncHandler(messageController.getUnreadMessagesCount)
);

export default router;