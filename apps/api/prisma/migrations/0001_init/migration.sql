-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "Tenant" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  "legalName" text NOT NULL,
  timezone text NOT NULL,
  "primaryEmail" text NOT NULL,
  "laborRateCents" integer NOT NULL,
  "taxRegion" text NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TYPE "RoleKey" AS ENUM ('OWNER','MANAGER','SERVICE_ADVISOR','TECHNICIAN','PARTS','ACCOUNTANT','READ_ONLY');
CREATE TYPE "PermissionKey" AS ENUM ('TENANT_MANAGE','USERS_MANAGE','CUSTOMERS_READ','CUSTOMERS_WRITE','VEHICLES_READ','VEHICLES_WRITE','RO_READ','RO_WRITE','INVENTORY_READ','INVENTORY_WRITE');
CREATE TYPE "RepairOrderStatus" AS ENUM ('DRAFT','NEEDS_APPROVAL','APPROVED','IN_PROGRESS','READY','INVOICED','PAID_CLOSED');

CREATE TABLE "Role" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  key "RoleKey" NOT NULL,
  name text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("tenantId", key)
);

CREATE TABLE "RolePermission" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "roleId" uuid NOT NULL REFERENCES "Role"(id) ON DELETE CASCADE,
  permission "PermissionKey" NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("roleId", permission)
);

CREATE TABLE "User" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text NOT NULL,
  "passwordHash" text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  "roleId" uuid NOT NULL REFERENCES "Role"(id) ON DELETE RESTRICT,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("tenantId", email)
);

CREATE TABLE "Session" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "userId" uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "tokenHash" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "expiresAt" timestamptz NOT NULL,
  "revokedAt" timestamptz
);

CREATE TABLE "Customer" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  notes text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "Vehicle" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "customerId" uuid NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
  vin text,
  plate text,
  make text,
  model text,
  year integer,
  trim text,
  engine text,
  notes text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "RepairOrder" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "customerId" uuid NOT NULL REFERENCES "Customer"(id) ON DELETE RESTRICT,
  "vehicleId" uuid NOT NULL REFERENCES "Vehicle"(id) ON DELETE RESTRICT,
  status "RepairOrderStatus" NOT NULL DEFAULT 'DRAFT',
  "totalCents" integer NOT NULL DEFAULT 0,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "AuditLog" (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  "actorUserId" uuid,
  action text NOT NULL,
  data jsonb NOT NULL,
  hash text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- RLS setup
ALTER TABLE "Role" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RolePermission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vehicle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RepairOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_role ON "Role"
  USING ("tenantId" = current_setting('app.tenant_id')::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation_role_permission ON "RolePermission"
  USING ("roleId" IN (SELECT id FROM "Role" WHERE "tenantId" = current_setting('app.tenant_id')::uuid))
  WITH CHECK ("roleId" IN (SELECT id FROM "Role" WHERE "tenantId" = current_setting('app.tenant_id')::uuid));
CREATE POLICY tenant_isolation_user ON "User"
  USING ("tenantId" = current_setting('app.tenant_id')::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation_session ON "Session"
  USING ("tenantId" = current_setting('app.tenant_id')::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation_customer ON "Customer"
  USING ("tenantId" = current_setting('app.tenant_id')::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation_vehicle ON "Vehicle"
  USING ("tenantId" = current_setting('app.tenant_id')::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation_repair_order ON "RepairOrder"
  USING ("tenantId" = current_setting('app.tenant_id')::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::uuid);
CREATE POLICY tenant_isolation_audit_log ON "AuditLog"
  USING ("tenantId" = current_setting('app.tenant_id')::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id')::uuid);

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tenant_updated_at BEFORE UPDATE ON "Tenant"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_role_updated_at BEFORE UPDATE ON "Role"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_user_updated_at BEFORE UPDATE ON "User"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_customer_updated_at BEFORE UPDATE ON "Customer"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_vehicle_updated_at BEFORE UPDATE ON "Vehicle"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_repair_order_updated_at BEFORE UPDATE ON "RepairOrder"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
