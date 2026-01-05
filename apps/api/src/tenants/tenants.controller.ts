import { Controller, Get, Req } from '@nestjs/common';
import { TenantsService } from './tenants.service.js';
import { RequestContext } from '../common/request-context.js';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('me')
  async me(@Req() req: RequestContext) {
    return this.tenantsService.getTenant(req.user?.tenantId);
  }
}
