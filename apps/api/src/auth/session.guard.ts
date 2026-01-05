import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RequestContext } from '../common/request-context.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<RequestContext>();
    const token = (req.signedCookies?.session ?? req.cookies?.session) as string | undefined;
    if (!token) {
      return true;
    }
    const session = await this.authService.getSession(token);
    if (!session) {
      return true;
    }
    req.user = {
      id: session.user.id,
      tenantId: session.user.tenantId,
      roleKey: session.user.role.key
    };
    await this.prisma.setTenant(session.user.tenantId);
    return true;
  }
}
