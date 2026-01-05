import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(tenantId: string | undefined) {
    if (!tenantId) {
      throw new ForbiddenException('Not authenticated');
    }
    return this.prisma.user.findMany({
      where: { tenantId },
      select: { id: true, email: true, name: true, active: true, role: true }
    });
  }
}
