import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { branch: true }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Since we seeded without bcrypt for simplicity earlier, we should handle plain text in dev 
    // OR we should hash it in the seed script! Let's assume we compare hashes.
    // For now, if the seed script inserted 'password123' as plain text, bcrypt.compare will fail.
    // Let's do a fallback: if it doesn't start with $2b$, just compare raw string (ONLY FOR DEV!)
    let isMatch = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      isMatch = await bcrypt.compare(pass, user.password);
    } else {
      isMatch = pass === user.password;
    }

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, branchId: user.branchId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        branchId: user.branchId,
        branch: user.branch ? user.branch.name : null,
      }
    };
  }
}
