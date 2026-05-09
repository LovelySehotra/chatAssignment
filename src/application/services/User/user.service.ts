import { IUser } from '@/domain/models';
import { IRepository } from '@/infrastructure';
import { AppError } from '@/interface/middleware/error/error';


export class UserService {
  constructor(private userRepository: IRepository<IUser>) {}
  async getUserById(userId: string): Promise<IUser | null> {
    const user = this.userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }
  async updateUser(
    userId: string,
    updateData: Partial<IUser>,
  ): Promise<IUser | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    const updatedUser = await this.userRepository.updateById(
      userId,
      updateData,
    );
    return updatedUser;
  }
  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.userRepository.deleteById(userId);
    if (!result) throw new AppError('User not found', 404);
    return true;
  }
}