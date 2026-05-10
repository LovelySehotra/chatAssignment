import { Router } from 'express';
import UserRouter from './user.router';
import MessageRouter from './message.router';
import ConversationRouter from './conversation.router';
const appRouter = Router();
appRouter.use('/users', UserRouter);
appRouter.use('/conversations', ConversationRouter);
appRouter.use('/messages', MessageRouter);

export { appRouter };