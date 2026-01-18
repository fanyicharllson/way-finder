import { PasswordUtil } from "../utils/password.util";
import { JWTUtil } from "../utils/jwt.util";
import { prisma } from "../config/database";
import { eventBus } from "../events/eventBus";
import { 
  Events, 
  UserRegisteredPayload, 
  UserLoggedInPayload,
  PasswordResetRequestedPayload,
  PasswordResetCompletedPayload
} from "../events/eventTypes";

export class AuthService {
  async register(data: RegisterDTO): Promise<AuthResponse> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      cacheStrategy: {
        ttl: 60,
        swr: 30,
      },
    });

    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Validate password
    const passwordValidation = PasswordUtil.validate(data.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    // Generate JWT token
    const token = JWTUtil.generate({
      userId: user.id,
      email: user.email,
    });

    // 🎯 Emit USER_REGISTERED event
    // This triggers email sending, default preferences creation, etc.
    const eventPayload: UserRegisteredPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      timestamp: new Date(),
    };
    eventBus.emitEvent(Events.USER_REGISTERED, eventPayload);

    return {
      user,
      token,
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await PasswordUtil.compare(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = JWTUtil.generate({
      userId: user.id,
      email: user.email,
    });

    // 🎯 Emit USER_LOGGED_IN event
    // This tracks user activity and analytics
    const eventPayload: UserLoggedInPayload = {
      userId: user.id,
      email: user.email,
      timestamp: new Date(),
    };
    eventBus.emitEvent(Events.USER_LOGGED_IN, eventPayload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || undefined,
      },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      cacheStrategy: {
        ttl: 120, // cache for 2 minutes
        swr: 60, // refresh in background
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        preferences: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  // Password Reset Methods
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists - security best practice
      return { message: "If your email is registered, you will receive a password reset code shortly." };
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 30 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // Invalidate any existing unused codes for this user
    await prisma.passwordReset.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Create new password reset record
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    // Emit PASSWORD_RESET_REQUESTED event
    const eventPayload: PasswordResetRequestedPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      code,
      expiresAt,
      timestamp: new Date(),
    };
    eventBus.emitEvent(Events.PASSWORD_RESET_REQUESTED, eventPayload);

    return { message: "If your email is registered, you will receive a password reset code shortly." };
  }

  async verifyResetCode(email: string, code: string): Promise<{ valid: boolean; message: string }> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { valid: false, message: "Invalid verification code" };
    }

    // Find valid password reset code
    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!resetRequest) {
      return { valid: false, message: "Invalid or expired verification code" };
    }

    return { valid: true, message: "Code verified successfully" };
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid verification code");
    }

    // Find valid password reset code
    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!resetRequest) {
      throw new Error("Invalid or expired verification code");
    }

    // Validate new password
    const passwordValidation = PasswordUtil.validate(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Hash new password
    const hashedPassword = await PasswordUtil.hash(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Mark code as used
    await prisma.passwordReset.update({
      where: { id: resetRequest.id },
      data: { used: true },
    });

    // Emit PASSWORD_RESET_COMPLETED event
    const eventPayload: PasswordResetCompletedPayload = {
      userId: user.id,
      email: user.email,
      timestamp: new Date(),
    };
    eventBus.emitEvent(Events.PASSWORD_RESET_COMPLETED, eventPayload);

    return { message: "Password reset successful" };
  }
}
