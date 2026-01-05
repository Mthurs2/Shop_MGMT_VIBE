import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCustomerInput } from '@shop/shared';
import { AuditService } from '../common/audit.service.js';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService
  ) {}

  async list(tenantId: string | undefined) {
    if (!tenantId) {
      throw new ForbiddenException('Not authenticated');
    }
    return this.prisma.customer.findMany({ where: { tenantId } });
  }

  async create(tenantId: string | undefined, input: CreateCustomerInput) {
    if (!tenantId) {
      throw new ForbiddenException('Not authenticated');
    }
    const customer = await this.prisma.customer.create({
      data: {
        tenantId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        notes: input.notes
      }
    });
    await this.auditService.log(tenantId, 'customer.created', { customerId: customer.id });
    return customer;
  }
}
