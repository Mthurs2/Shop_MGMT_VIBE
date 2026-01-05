import { Request } from 'express';

export interface RequestContext extends Request {
  user?: {
    id: string;
    tenantId: string;
    roleKey: string;
  };
}
