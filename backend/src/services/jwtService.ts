import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class JWTService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  static generateJWT(userId: string, email?: string, role: string = 'user'): string {
    const payload = {
      sub: userId,
      email,
      role,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, this.JWT_SECRET);
  }

  static verifyJWT(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET, { algorithms: ['HS256'] });
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
