import bcrypt from 'bcryptjs';
import { IRepository } from "@/infrastructure";
import { JwtService } from "./jwt.service";
import { IUser } from "@/domain/models";
import { CreateUserDto, LoginDto, UpdateUserDto, UserResponseDto } from "@/application/dtos";
import { AppError } from "@/interface/middleware/error/error";


export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: IRepository<IUser>,
  ) { }
  async signup(userData: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findOne({
      email: userData.email,
    });
    if (existingUser)
      throw new AppError('User with this email already exists', 409);
    const newUser = await this.userRepository.create({
      ...userData,
    });
    return {
      ...newUser,
      _id: newUser._id.toString(),
      createdAt: newUser.createdAt,
    };
  }
  async login(loginCredentials: LoginDto): Promise<UserResponseDto> {
    const { email, password } = loginCredentials;
    const user = await this.userRepository.findOne({ email }, {
      select: {
        password: 1,
        email: 1,
        username: 1,
        avatar: 1,
        bio: 1,
        createdAt: 1,
      }
    });
    if (!user) throw new AppError('User not found', 404);
    if (password && !(await bcrypt.compare(password, user.password)))
      throw new AppError('Invalid credentials', 404);
    return { ...user, _id: user._id.toString(), };
  }
  async refreshAccessToken(refreshToken: string): Promise<string> {
    const newAccessToken =
      this.jwtService.exchangeRefreshTokenForAccess(refreshToken);
    if (!newAccessToken) throw new AppError('Invalid refresh token', 401);
    return newAccessToken;
  }
  async update(userData: Partial<UpdateUserDto>, userId: string): Promise<UserResponseDto> {
    const updatedUser = await this.userRepository.updateOne(
      { _id: userId },
      userData
    );
    if (!updatedUser) throw new AppError('User not found', 404);
    return {
      ...updatedUser,
      _id: updatedUser._id.toString(),
      createdAt: updatedUser.createdAt,
    };
  }
}