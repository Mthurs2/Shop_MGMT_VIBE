import { describe, expect, it } from 'vitest';
import { Client } from 'pg';
import { randomUUID } from 'crypto';

const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://shop_app:shop_password@localhost:5432/shop_mgmt';

async function withClient<T>(fn: (client: Client) => Promise<T>) {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

describe('RLS tenant isolation', () => {
  it('isolates customers by tenant_id', async () => {
    await withClient(async (client) => {
      const tenantA = randomUUID();
      const tenantB = randomUUID();

      await client.query(
        `INSERT INTO "Tenant" (id, name, "legalName", timezone, "primaryEmail", "laborRateCents", "taxRegion", currency)
         VALUES ($1, 'Tenant A', 'Tenant A LLC', 'UTC', 'a@example.com', 10000, 'TX', 'USD'),
                ($2, 'Tenant B', 'Tenant B LLC', 'UTC', 'b@example.com', 10000, 'TX', 'USD')`,
        [tenantA, tenantB]
      );

      await client.query('SELECT set_config($1, $2, true)', ['app.tenant_id', tenantA]);
      await client.query(
        `INSERT INTO "Customer" (id, "tenantId", name)
         VALUES ($1, $2, 'Customer A')`,
        [randomUUID(), tenantA]
      );

      await client.query('SELECT set_config($1, $2, true)', ['app.tenant_id', tenantB]);
      await client.query(
        `INSERT INTO "Customer" (id, "tenantId", name)
         VALUES ($1, $2, 'Customer B')`,
        [randomUUID(), tenantB]
      );

      const resA = await client.query('SELECT name FROM "Customer"');
      expect(resA.rows).toHaveLength(1);
      expect(resA.rows[0].name).toBe('Customer B');

      await client.query('SELECT set_config($1, $2, true)', ['app.tenant_id', tenantA]);
      const resB = await client.query('SELECT name FROM "Customer"');
      expect(resB.rows).toHaveLength(1);
      expect(resB.rows[0].name).toBe('Customer A');
    });
  });

  it('blocks cross-tenant inserts', async () => {
    await withClient(async (client) => {
      const tenantA = randomUUID();
      await client.query(
        `INSERT INTO "Tenant" (id, name, "legalName", timezone, "primaryEmail", "laborRateCents", "taxRegion", currency)
         VALUES ($1, 'Tenant C', 'Tenant C LLC', 'UTC', 'c@example.com', 10000, 'TX', 'USD')`,
        [tenantA]
      );

      await client.query('SELECT set_config($1, $2, true)', ['app.tenant_id', tenantA]);

      await expect(
        client.query(`INSERT INTO "Customer" (id, "tenantId", name) VALUES ($1, $2, 'Bad')`, [
          randomUUID(),
          randomUUID()
        ])
      ).rejects.toThrow();
    });
  });
});
