import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data: RegisterDTO = req.body;

      // Validate required fields
      if (!data.name || !data.email || !data.password) {
        return res.status(400).json({
          success: false,
          message: "Name, email, and password are required",
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }

      //Call services
      const result = await authService.register(data);

      return res.status(201).json({
        success: true,
        message: "Registration successful",
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Registration failed",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data: LoginDTO = req.body;

      // Validate required fields
      if (!data.email || !data.password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const result = await authService.login(data);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: error.message || "Login failed",
      });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      const user = await authService.getMe(userId);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "User not found! Please login",
      });
    }
  }

  async logout(req: Request, res: Response) {
    // For JWT, logout is handled client-side by removing the token
    // You can add token blacklisting here if needed
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  }

  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }

      const result = await authService.requestPasswordReset(email);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to process password reset request",
      });
    }
  }

  async verifyResetCode(req: Request, res: Response) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: "Email and verification code are required",
        });
      }

      const result = await authService.verifyResetCode(email, code);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to verify code",
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Email, code, and new password are required",
        });
      }

      const result = await authService.resetPassword(email, code, newPassword);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to reset password",
      });
    }
  }
}
