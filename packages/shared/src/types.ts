export type RoleKey =
  | 'OWNER'
  | 'MANAGER'
  | 'SERVICE_ADVISOR'
  | 'TECHNICIAN'
  | 'PARTS'
  | 'ACCOUNTANT'
  | 'READ_ONLY';

export type PermissionKey =
  | 'TENANT_MANAGE'
  | 'USERS_MANAGE'
  | 'CUSTOMERS_READ'
  | 'CUSTOMERS_WRITE'
  | 'VEHICLES_READ'
  | 'VEHICLES_WRITE'
  | 'RO_READ'
  | 'RO_WRITE'
  | 'INVENTORY_READ'
  | 'INVENTORY_WRITE';
