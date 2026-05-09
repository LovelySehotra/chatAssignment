import { AuthService } from '@/application/services';
import { Request, Response } from 'express';

export class UserController {
  private authService: AuthService;
  constructor(authService: AuthService) {
    this.authService = authService;
  }
  signupUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const newUser = await this.authService.signup({ email, password});
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
    const updatedUser = await this.authService.update(updateData, userId);
    return res.status(200).json(updatedUser);
  }
}