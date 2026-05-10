import { Router } from "express";
import { ConversationController } from "../controllers/conversatiom.controller";
import { ConversationService } from "@/application/services/Socket/conversation.service";
import { RepositoryFactory } from "@/infrastructure";
import { Conversation } from "@/domain/models";
import { UseRequestDto } from "../middleware/dtos/validation";
import { CreateConversationDto } from "@/application/dtos/Socket/conversation.dto";
import { IsAuthenticated } from "../middleware/auth/authGuard";

const router = Router();
const conersationRepository = RepositoryFactory.createFull(Conversation);
const conversationService = new ConversationService(conersationRepository);
const conversationController = new ConversationController(conversationService);

router.use(IsAuthenticated);
router.post(
    '/direct',
    UseRequestDto(CreateConversationDto),
    conversationController.createDirectConversation);
router.post(
    '/group',
    UseRequestDto(CreateConversationDto),
    conversationController.createGroupConversation);
router.get(
    '/',
    conversationController.getUserConversations);
router.get(
    '/:conversationId',
    conversationController.getConversationById);
export default router;