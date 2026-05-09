import bcrypt from 'bcryptjs';
import { IRepository } from "@/infrastructure";
import { JwtService } from "./jwt.service";
import { IUser } from "@/domain/models";
import { CreateUserDto, LoginDto, UserResponseDto } from "@/application/dtos";
import { AppError } from "@/interface/middleware/error/error";


export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: IRepository<IUser>,
  ) {}
  async signup(userData: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findOne({
      email: userData.email,
    });
    if (!existingUser)
      throw new AppError('User with this email already exists', 409);
    const newUser = await this.userRepository.create({
      ...userData,
    });
    const tokens = this.jwtService.createAccessToken(newUser._id.toString());
    return {
      ...newUser,
      _id: newUser._id.toString(),
      createdAt: newUser.createdAt,
    };
  }
  async login(loginCredentials: LoginDto): Promise<IUser> {
    const { email, password } = loginCredentials;
    const user = await this.userRepository.findOne({ email });
    if (!user) throw new AppError('User not found', 404);
    if (password && !(await bcrypt.compare(password, user.password)))
      throw new AppError('Invalid credentials', 404);
    const accessToken = this.jwtService.createAccessToken(String(user._id));
    const refreshToken = this.jwtService.createRefreshToken(String(user._id));
    return { ...user, accessToken, refreshToken };
  }
  async refreshAccessToken(refreshToken: string): Promise<string> {
    const newAccessToken =
      this.jwtService.exchangeRefreshTokenForAccess(refreshToken);
    if (!newAccessToken) throw new AppError('Invalid refresh token', 401);
    return newAccessToken;
  }
}