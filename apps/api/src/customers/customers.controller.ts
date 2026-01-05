import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { RequestContext } from '../common/request-context.js';
import { createCustomerSchema } from '@shop/shared';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async list(@Req() req: RequestContext) {
    return this.customersService.list(req.user?.tenantId);
  }

  @Post()
  async create(@Req() req: RequestContext, @Body() body: Record<string, unknown>) {
    const input = createCustomerSchema.parse(body);
    return this.customersService.create(req.user?.tenantId, input);
  }
}
