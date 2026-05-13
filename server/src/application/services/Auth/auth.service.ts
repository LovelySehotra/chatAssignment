import bcrypt from 'bcryptjs';
import { IRepository } from "@/infrastructure";
import { JwtService } from "./jwt.service";
import { IUser } from "@/domain/models";
import { CreateUserDto, LoginDto, UpdateUserDto, UserResponseDto } from "@/application/dtos";
import { AppError, NotFoundError, UnauthorizedError, ConflictError } from "@/interface/middleware/error/error";


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
      throw new ConflictError('User with this email already exists');
    const newUser = await this.userRepository.create({
      ...userData,
    });
    const accessToken = this.jwtService.createAccessToken(newUser._id.toString());
    const refreshToken = this.jwtService.createRefreshToken(newUser._id.toString());

    return {
      ...newUser,
      _id: newUser._id.toString(),
      createdAt: newUser.createdAt,
      accessToken,
      refreshToken,
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
    if (!user) throw new NotFoundError('User not found');
    if (password && !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedError('Invalid credentials');
    const accessToken = this.jwtService.createAccessToken(user._id.toString());
    const refreshToken = this.jwtService.createRefreshToken(user._id.toString());
    return { ...user, _id: user._id.toString(), accessToken, refreshToken };
  }
  async refreshAccessToken(refreshToken: string): Promise<string> {
    const newAccessToken =
      this.jwtService.exchangeRefreshTokenForAccess(refreshToken);
    if (!newAccessToken) throw new UnauthorizedError('Invalid refresh token');
    return newAccessToken;
  }
  async update(userData: Partial<UpdateUserDto>, userId: string): Promise<UserResponseDto> {
    const updatedUser = await this.userRepository.updateOne(
      { _id: userId },
      userData
    );
    if (!updatedUser) throw new NotFoundError('User not found');
    return {
      ...updatedUser,
      _id: updatedUser._id.toString(),
      createdAt: updatedUser.createdAt,

    };
  }
}