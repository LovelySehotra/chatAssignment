import { AuthService, UserService } from '@/application/services';
import { Request, Response } from 'express';

export class UserController {
  private authService: AuthService;
  private userService: UserService;
  constructor(authService: AuthService, userService: UserService) {
    this.authService = authService;
    this.userService = userService;
  }
  signupUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const newUser = await this.authService.signup({ email, password });
    return res.status(201).json(newUser);
  };
  loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const loginResponse = await this.authService.login({ email, password });
    return res.status(200).json(loginResponse);
  };
  updateUser = async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const updateData = req.body;
    const updatedUser = await this.userService.updateUser((String(userId)), updateData);
    return res.status(200).json(updatedUser);
  }
  getCurrentUser = async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const currentUser = await this.userService.getCurrentUser((String(userId)));
    return res.status(200).json(currentUser);
  }
  getAllUsers = async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const users = await this.userService.getAllUsers();
    return res.status(200).json(users);
  }
  deleteUser = async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    await this.userService.deleteUser((String(userId)));
    return res.status(204).send();
  }
}