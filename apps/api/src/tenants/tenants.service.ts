import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTenant(tenantId: string | undefined) {
    if (!tenantId) {
      throw new ForbiddenException('Not authenticated');
    }
    return this.prisma.tenant.findUnique({ where: { id: tenantId } });
  }
}
