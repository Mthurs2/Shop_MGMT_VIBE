import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('ChangeMe123!');

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Auto Shop',
      legalName: 'Demo Auto Shop LLC',
      timezone: 'America/Chicago',
      primaryEmail: 'owner@demo.com',
      laborRateCents: 12500,
      taxRegion: 'TX',
      currency: 'USD'
    }
  });

  const role = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      key: 'OWNER',
      name: 'Owner'
    }
  });

  await prisma.rolePermission.createMany({
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
    ].map((permission) => ({ roleId: role.id, permission }))
  });

  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'owner@demo.com',
      name: 'Demo Owner',
      passwordHash,
      roleId: role.id
    }
  });

  await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenant.id}, true)`;

  await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '555-0100'
    }
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
