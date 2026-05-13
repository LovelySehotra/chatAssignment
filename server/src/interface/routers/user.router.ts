import { Router } from 'express';
import { User } from '@/domain/models';
import {
  AuthService,
  JwtService,
  UserService,
} from '@/application/services';
import {
  CreateUserDto,
  LoginDto,
  UpdateUserDto,
  UserResponseDto,
} from '@/application/dtos';
import { RepositoryFactory } from '@/infrastructure';
import { UserController } from '../controllers/user.controller';
import {
  UseRequestDto,
  UseResponseDto,
} from '../middleware/dtos/validation';
import { IsAuthenticated } from '../middleware/auth/authGuard';
import { asyncHandler } from '@/utils/asyncHandler';

const router = Router();
// Dependencies

const userRepository = RepositoryFactory.createFull(User);
const jwtService = new JwtService();
const userService = new UserService(userRepository);
const authService = new AuthService(
  jwtService,
  userRepository,
);
const userController = new UserController(
  authService,
  userService,
);

// Public

router.post(
  '/',
  UseRequestDto(CreateUserDto),
  UseResponseDto(UserResponseDto),
  asyncHandler(userController.signupUser),
);

router.post(
  '/login',
  UseRequestDto(LoginDto),
  UseResponseDto(UserResponseDto),
  asyncHandler(userController.loginUser),
);

// Protected

router.use(IsAuthenticated);

router.get(
  '/me',
  UseResponseDto(UserResponseDto),
  asyncHandler(userController.getCurrentUser),
);
router.get(
  '/',
  UseResponseDto(UserResponseDto),
  asyncHandler(userController.getAllUsers),
);
router.patch(
  '/',
  UseRequestDto(UpdateUserDto),
  UseResponseDto(UserResponseDto),
  asyncHandler(userController.updateUser),
);
router.delete(
  '/',
  asyncHandler(userController.deleteUser),
);
export default router;