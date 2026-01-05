import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import crypto from 'crypto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(tenantId: string, action: string, data: Record<string, unknown>, actorUserId?: string) {
    const last = await this.prisma.auditLog.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
    const payload = JSON.stringify({ action, data, actorUserId, timestamp: new Date().toISOString() });
    const hash = crypto.createHash('sha256').update(`${last?.hash ?? ''}:${payload}`).digest('hex');
    return this.prisma.auditLog.create({
      data: {
        tenantId,
        actorUserId,
        action,
        data,
        hash
      }
    });
  }
}
