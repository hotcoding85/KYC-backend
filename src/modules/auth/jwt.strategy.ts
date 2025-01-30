import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './auth.constants';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly jwtService: JwtService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          if (!req.isApiCall) {
            return req.cookies?.Authentication;
          } else {
            return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
          }
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      username: payload.username,
      user_id: payload.user_id,
    };
  }

  async validateToken(req: Request) {
    try {
      let token: string | null = null;
      if (!req.isApiCall) {
        token = req.cookies?.Authentication;
      } else {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1];
        }
      }
      if (!token) {
        throw new UnauthorizedException('Token not found');
      }
      
      const payload = this.jwtService.verify(token, {
        secret: jwtConstants.secret,
      });
      return { valid: true, payload };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
