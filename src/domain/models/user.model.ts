import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '@/config';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    maxlength: [50, 'Username cannot be more than 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
  },
}, {
  timestamps: true,
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function (): string {
  return jwt.sign({ id: this._id }, JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema); 