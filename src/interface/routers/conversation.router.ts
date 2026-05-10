import { Router } from "express";
import { ConversationController } from "../controllers/conversatiom.controller";
import { ConversationService } from "@/application/services/Socket/conversation.service";
import { RepositoryFactory } from "@/infrastructure";
import { Conversation } from "@/domain/models";

const router = Router();
const conersationRepository = RepositoryFactory.createFull(Conversation);
const conversationService = new ConversationService(conersationRepository);
const conversationController = new ConversationController(conversationService);

router.post(
    '/direct',
    conversationController.createDirectConversation);
router.post(
    '/group',
    conversationController.createGroupConversation);
router.get(
    '/',
    conversationController.getUserConversations);
router.get(
    '/:conversationId',
    conversationController.getConversationById);
export default router;