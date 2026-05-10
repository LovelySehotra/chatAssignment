import { IUser } from '@/domain/models';
import { IRepository } from '@/infrastructure';
import { NotFoundError } from '@/interface/middleware/error/error';


export class UserService {
  private userRepository: IRepository<IUser>;
  constructor(userRepository: IRepository<IUser>) {
    this.userRepository = userRepository;
  }
  async getUserById(userId: string): Promise<IUser | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }
  async updateUser(userId: string, updateData: Partial<IUser>,): Promise<IUser | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    const updatedUser = await this.userRepository.updateById(
      userId,
      updateData,
    );
    return updatedUser;
  }
  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.userRepository.deleteById(userId);
    if (!result) throw new NotFoundError('User not found');
    return true;
  }
  async getCurrentUser(userId: string): Promise<IUser | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
  }
  async getAllUsers(): Promise<IUser[]> {
    const users = await this.userRepository.findMany({});
    return users;
  }

}