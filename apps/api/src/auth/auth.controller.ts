import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { loginSchema, tenantSignupSchema } from '@shop/shared';
import { Request, Response } from 'express';
import { RequestContext } from '../common/request-context.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() body: { ownerName: string; password: string } & Record<string, unknown>,
    @Res({ passthrough: true }) res: Response
  ) {
    const input = tenantSignupSchema.parse(body);
    const ownerName = String(body.ownerName ?? '');
    const password = String(body.password ?? '');
    const result = await this.authService.signup({ ...input, ownerName, password });
    const session = await this.authService.createSession(result.user.id, result.tenant.id);
    res.cookie('session', session.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      signed: true
    });
    return { tenantId: result.tenant.id, userId: result.user.id };
  }

  @Post('login')
  async login(@Body() body: Record<string, unknown>, @Res({ passthrough: true }) res: Response) {
    const input = loginSchema.parse(body);
    const user = await this.authService.validateLogin(input);
    const session = await this.authService.createSession(user.id, user.tenantId);
    res.cookie('session', session.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      signed: true
    });
    return { tenantId: user.tenantId, userId: user.id };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.session as string | undefined;
    if (token) {
      await this.authService.revokeSession(token);
    }
    res.clearCookie('session');
    return { success: true };
  }

  @Get('me')
  async me(@Req() req: RequestContext) {
    if (!req.user) {
      return { user: null };
    }
    return { user: req.user };
  }

  @Get('csrf')
  csrf(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.csrfToken as string | undefined;
    if (!token) {
      return res.status(200).json({ csrfToken: null });
    }
    return res.status(200).json({ csrfToken: token });
  }
}
