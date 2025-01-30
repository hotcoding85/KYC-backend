import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', 
      passwordField: 'password', 
      passReqToCallback: true,
    });
  }

  async validate(req: Request, email: string, password: string): Promise<any> {
    const body = req.body as unknown as {
      company_id: string;
      email: string;
      password: string;
    };

    const company_id = body.company_id || process.env.PARENT_COMPANY;

    if (!company_id) {
      throw new UnauthorizedException('Company ID is required');
    }

    const user = await this.authService.validateUser(
      email,
      password,
      company_id,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid Email, Password, or Company');
    }
    return user;
  }
}
