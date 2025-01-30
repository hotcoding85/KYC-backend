import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiOrFrontendMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.headers['x-api-request']) {
      req.isApiCall = true;
    } else {
      req.isApiCall = false;
    }
    next();
  }
}