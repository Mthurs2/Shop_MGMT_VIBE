import { Controller, Get, Req } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { RequestContext } from '../common/request-context.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list(@Req() req: RequestContext) {
    return this.usersService.listUsers(req.user?.tenantId);
  }
}
