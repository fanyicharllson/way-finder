import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export class PasswordUtil {
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static validate(password: string): { valid: boolean; message?: string } {
    if (password.length < 6) {
      return {
        valid: false,
        message: "Password must be at least 6 characters",
      };
    }
    return { valid: true };
  }
}
