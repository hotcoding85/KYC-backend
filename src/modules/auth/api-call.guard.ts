import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ALLOW_API_CALL } from '../../common/decorators/allow-api-call.decorator';

@Injectable()
export class ApiCallGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const isApiCall = request.isApiCall;

    // Check if the route allows API calls
    const allowApiCall = this.reflector.getAllAndOverride<boolean>(ALLOW_API_CALL, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If API call is allowed or it's not an API call, allow access
    if (allowApiCall || !isApiCall) {
      return true;
    }

    // Otherwise, deny access
    throw new UnauthorizedException('This route is not accessible via API calls.');
  }
}