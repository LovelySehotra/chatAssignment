import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsIn,
} from "class-validator";
import { Type, Transform, Exclude } from "class-transformer";



// Create User DTO
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: "Username cannot be more than 50 characters" })
  @Transform(({ value }) => value?.trim())
  username!: string;

  @IsEmail({}, { message: "Please provide a valid email" })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password!: string;
  @IsOptional()
  @IsString()
  avatar?: string;
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "Bio cannot be more than 500 characters" })
  bio?: string;
}

// Update User DTO
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: "Username cannot be more than 50 characters" })
  @Transform(({ value }) => value?.trim())
  username?: string;
  @IsOptional()
  @IsEmail({}, { message: "Please provide a valid email" })
  email?: string;
  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "Bio cannot be more than 500 characters" })
  bio?: string;

}

// Login DTO
export class LoginDto {
  @IsEmail({}, { message: "Please provide a valid email" })
  @IsNotEmpty()
  email!: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password!: string;
}

// Change Password DTO
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "Current password must be at least 6 characters" })
  currentPassword!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "New password must be at least 6 characters" })
  newPassword!: string;
}

// Forgot Password DTO
export class ForgotPasswordDto {
  @IsEmail({}, { message: "Please provide a valid email" })
  @IsNotEmpty()
  email!: string;
}

// Reset Password DTO
export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  resetToken!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password!: string;
}

// Verify Email DTO
export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  verificationToken!: string;
}

// User Response DTO (for API responses - excludes sensitive data)
export class UserResponseDto {
  @Type(() => String)
  _id!: string;
  @IsString()
  username!: string;
  @IsEmail()
  email!: string;
  @IsOptional()
  @IsString()
  avatar?: string;
  @IsOptional()
  @IsString()
  bio?: string;
  @Type(() => Date)
  createdAt!: Date;
  @Type(() => Date)
  updatedAt!: Date;
  // Exclude sensitive fields
  @Exclude()
  password?: string;
}

// Query/Filter DTOs
export class GetUsersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
  @IsOptional()
  @IsString()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn([
    "createdAt",
    "updatedAt",
    "username",
    "email",
  ])
  sortBy?: string = "createdAt";

  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "desc";
}


// Bulk Operations DTO
export class BulkDeleteUsersDto {
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  userIds!: string[];
}