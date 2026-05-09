import { Router } from 'express';
import { User } from '@/domain/models';
import { AuthService, JwtService } from '@/application/services';
import { UserController } from '../controllers/user.controller';
import { RepositoryFactory } from '@/infrastructure';

const userRepository = RepositoryFactory.createFull(User)
const authService = new AuthService(new JwtService(), userRepository);
const userController = new UserController(authService);
const router = Router();

router.route('/signup').post(userController.signupUser);
router.route('/login').post(userController.loginUser);


export default router;