import { Router } from "express";
import { ConversationController } from "../controllers/conversation.controller";
import { ConversationService } from "@/application/services/Socket/conversation.service";
import { RepositoryFactory } from "@/infrastructure";
import { Conversation } from "@/domain/models";
import { UseRequestDto, UseResponseDto } from "../middleware/dtos/validation";
import { ConversationResponseDto, CreateConversationDto } from "@/application/dtos/Socket/conversation.dto";
import { IsAuthenticated } from "../middleware/auth/authGuard";
import { asyncHandler } from "@/utils/asyncHandler";

const router = Router();
const conversationRepository = RepositoryFactory.createFull(Conversation);
const conversationService = new ConversationService(conversationRepository);
const conversationController = new ConversationController(conversationService);

router.use(IsAuthenticated);

router.post(
    '/direct',
    UseRequestDto(CreateConversationDto),

    asyncHandler(conversationController.createDirectConversation)
);

router.post(
    '/group',
    UseRequestDto(CreateConversationDto),

    asyncHandler(conversationController.createGroupConversation)
);

router.get(
    '/',
    UseResponseDto(ConversationResponseDto),
    asyncHandler(conversationController.getUserConversations)
);

router.get(
    '/:conversationId',
    UseResponseDto(ConversationResponseDto),
    asyncHandler(conversationController.getConversationById)
);

export default router;