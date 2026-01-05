import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginInput, TenantSignupInput, passwordSchema } from '@shop/shared';
import argon2 from 'argon2';
import crypto from 'crypto';
import { add } from 'date-fns';

const SESSION_DAYS = 14;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signup(input: TenantSignupInput & { ownerName: string; password: string }) {
    passwordSchema.parse(input.password);
    const passwordHash = await argon2.hash(input.password);

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: input.name,
          legalName: input.legalName,
          timezone: input.timezone,
          primaryEmail: input.primaryEmail,
          laborRateCents: input.laborRateCents,
          taxRegion: input.taxRegion,
          currency: input.currency
        }
      });

      const ownerRole = await tx.role.create({
        data: {
          tenantId: tenant.id,
          key: 'OWNER',
          name: 'Owner'
        }
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: input.primaryEmail,
          name: input.ownerName,
          passwordHash,
          roleId: ownerRole.id
        }
      });

      await tx.rolePermission.createMany({
        data: [
          'TENANT_MANAGE',
          'USERS_MANAGE',
          'CUSTOMERS_READ',
          'CUSTOMERS_WRITE',
          'VEHICLES_READ',
          'VEHICLES_WRITE',
          'RO_READ',
          'RO_WRITE',
          'INVENTORY_READ',
          'INVENTORY_WRITE'
        ].map((permission) => ({ roleId: ownerRole.id, permission }))
      });

      return { tenant, user };
    });
  }

  async validateLogin(input: LoginInput) {
    await this.prisma.setTenant(input.tenantId);
    const user = await this.prisma.user.findFirst({
      where: { tenantId: input.tenantId, email: input.email, active: true },
      include: { role: true }
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const match = await argon2.verify(user.passwordHash, input.password);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async createSession(userId: string, tenantId: string) {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = add(new Date(), { days: SESSION_DAYS });

    await this.prisma.session.create({
      data: {
        tenantId,
        userId,
        tokenHash,
        expiresAt
      }
    });

    return { token, expiresAt };
  }

  async revokeSession(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await this.prisma.session.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  async getSession(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    return this.prisma.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      include: { user: { include: { role: true } } }
    });
  }
}
