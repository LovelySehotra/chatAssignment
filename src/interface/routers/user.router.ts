import { Router } from 'express';
import { User } from '@/domain/models';
import { AuthService, JwtService } from '@/application/services';
import { UserController } from '../controllers/user.controller';
import { RepositoryFactory } from '@/infrastructure';
import { UseRequestDto, UseResponseDto } from '../middleware/dtos/validation';
import { CreateUserDto, LoginDto, UpdateUserDto, UserResponseDto } from '@/application/dtos';
import { IsAuthenticated } from '../middleware/auth/authGuard';

const userRepository = RepositoryFactory.createFull(User)
const authService = new AuthService(new JwtService(), userRepository);
const userController = new UserController(authService);
const router = Router();


// User registration
router
    .route('/')
    .post(
        UseRequestDto(CreateUserDto),
        UseResponseDto(UserResponseDto),
        userController.signupUser
    );
// User login
router
    .route('/login')
    .post(

        UseRequestDto(LoginDto),
        UseResponseDto(UserResponseDto),
        userController.loginUser
    );

// User update (requires authentication)
router.route('/').patch(
    IsAuthenticated,
    UseRequestDto(UpdateUserDto),
    UseResponseDto(UserResponseDto),
    userController.updateUser
);


export default router;