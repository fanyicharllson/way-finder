import jwt, { SignOptions, Secret } from "jsonwebtoken";

const JWT_SECRET: Secret =
  process.env.JWT_SECRET || "fallback-secret-change-this";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "3d";

export class JWTUtil {
  /**
   * Generates a JWT token with the given payload.
   * The token will expire in the duration specified by JWT_EXPIRES_IN.
   * @param {JWTPayload} payload - The payload to include in the JWT token.
   * @returns {string} The generated JWT token.
   */
  static generate(payload: JWTPayload): string {
    return jwt.sign(payload as string | object | Buffer, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as SignOptions);
  }

  /**
   * Verifies a JWT token and returns the payload.
   * @throws {Error} If the token is invalid or expired.
   * @param {string} token - The JWT token to verify.
   * @returns {JWTPayload} The payload of the verified token.
   */
  static verify(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Attempts to decode a JWT token and returns the payload if successful.
   * If the token is invalid, expired, or malformed, returns null.
   * @param {string} token - The JWT token to decode.
   * @returns {JWTPayload | null} The payload of the decoded token, or null if decoding fails. **/
  static decode(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }
}
