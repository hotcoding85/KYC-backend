import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';

@Injectable()
export class RefreshGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    const authToken = request.cookies?.Authentication;
    const refToken = request.cookies?.Refresh;
    if (!authToken && refToken) {
      try {
        const { cookie, refreshCookie, accessToken, refreshToken } =
          await this.authService.refreshTokens(refToken, request);
        response.setHeader('Set-Cookie', [cookie, refreshCookie]);
        request.cookies['Authentication'] = accessToken;
        if (refreshToken) {
          request.cookies['Refresh'] = refreshToken;
        }
      } catch (error) {
        console.log(error);
        throw new UnauthorizedException('Token refresh failed');
      }
    }

    return true;
  }
}
