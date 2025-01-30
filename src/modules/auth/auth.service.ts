import {
  Injectable,
  ConflictException,
  Req,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SessionService } from '../session/session.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreateUserWithProfileDto } from '../user/dto/create-user-with-profile.dto';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import * as useragent from 'useragent';
import * as geoip from 'geoip-lite';
import * as UAParser from 'ua-parser-js';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { ROLE } from 'src/lib/enums';
import { ChangeEmailDto } from './dto/change-email.dto';
@Injectable()
export class AuthService {
  private readonly saltRounds: number;

  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private readonly sessionService: SessionService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly jwtStrategy: JwtStrategy,
  ) {
    this.saltRounds = parseInt(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS'),
      10,
    );
  }

  async startRegister(createUserDto: CreateUserDto): Promise<any> {
    const { email, password, company_id, ...userInfo } = createUserDto;

    const existingUser = await this.userService.check(email, company_id);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    return true;
  }

  async register(
    createUserWithProfileDto: CreateUserWithProfileDto,
  ): Promise<any> {
    const { email, password, company_id, ...userInfo } =
      createUserWithProfileDto.user;
    const existingUser = await this.userService.check(email, company_id);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const secret = speakeasy.generateSecret({ length: 20 });
    const otpauthURL = secret.otpauth_url;
    const qrCode = await qrcode.toDataURL(otpauthURL);

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    const user = await this.userService.create({
      user: {
        ...userInfo,
        role: ROLE.END_USER,
        email,
        company_id,
        password: hashedPassword,
        authenticator_secret: secret.base32,
      },
      profile: createUserWithProfileDto.profile,
      onboarding: createUserWithProfileDto.onboarding,
    });

    return {
      message: 'User registered successfully',
      user_id: user.user_id,
      qrCode,
      secret: secret.base32,
      profile: user?.userProfile,
    };
  }

  async registerCompanyAccount(createUserDto: CreateUserDto) {
    const { email, password, company_id, ...userInfo } = createUserDto;

    const existingUser = await this.userService.check(email, company_id);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const secret = speakeasy.generateSecret({ length: 20 });

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    const user = await this.userService.create({
      user: {
        ...userInfo,
        email,
        company_id,
        password: hashedPassword,
        role: ROLE.COMPANY_ADMINISTRATOR,
        authenticator_secret: secret.base32,
      },
      profile: {},
      onboarding: {},
    });

    return user;
  }

  async registerTeamMember(createUserDto: CreateUserDto) {
    const { email, password, company_id, ...userInfo } = createUserDto;

    const existingUser = await this.userService.check(email, company_id);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const secret = speakeasy.generateSecret({ length: 20 });

    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    const user = await this.userService.create({
      user: {
        ...userInfo,
        email,
        company_id,
        password: hashedPassword,
        role: ROLE.COMPANY_USER,
        authenticator_secret: secret.base32,
      },
      profile: {},
      onboarding: {},
    });

    return user;
  }

  async validate2FA(user_id: string, company_id: string, token: string) {
    // const user = await this.userService.findByUserId(user_id, company_id);

    // if (!user) {
    //   throw new UnauthorizedException('User not found');
    // }

    // const isVerified = speakeasy.totp.verify({
    //   secret: user.authenticator_secret,
    //   encoding: 'base32',
    //   token,
    //   window: 0,
    // });
    // if (!isVerified) {
    //   throw new UnauthorizedException('Invalid TOTP code');
    // }

    return true;
  }

  async validateUser(
    email: string,
    pass: string,
    company_id: string,
  ): Promise<any> {
    const user = await this.userService.check(email, company_id);
    if (user) {
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async loginRequest(user: any, @Req() req: Request) {
    const payload = { email: user.email, sub: user.id };
    const otpToken = this.jwtService.sign(payload, { expiresIn: '2m' });
    const ipAddress = req.headers['x-forwarded-for']
      ? req.headers['x-forwarded-for'][0]
      : '127.0.0.1';
    const geo = geoip.lookup(ipAddress);
    const ua = req.headers['user-agent'];
    const agent = useragent.parse(ua);
    const parser = new UAParser();
    const result = parser.setUA(ua).getResult();
    const dateNow = new Date();
    const expires = new Date(dateNow.getTime() + 2 * 60 * 1000);

    const sessionData = {
      user_id: user.user_id,
      source: 'login',
      ip: ipAddress,
      platform: agent.os.toString(),
      browser: agent.toAgent(),
      device_type: agent.device.toString(),
      maker: result.device.vendor || 'Unknown',
      model: result.device.model || 'Unknown',
      city: geo?.city || 'Unknown',
      country: geo?.country || 'Unknown',
      longitude: geo?.longitude || 'Unknown',
      latitude: geo?.latitude || 'Unknown',
      token: null,
      expires: expires,
      otp_token: otpToken,
    };

    await this.sessionService.createSession(sessionData);
    const domain = process.env.DOMAIN || '';
    return {
      cookie: `Confirmation=${otpToken}; HttpOnly; Path=/; Domain=${domain}; Max-Age=120; SameSite=Lax`,
    };
  }

  async login(user: any, @Req() req: Request) {
    const payload = { email: user.email, sub: user.id };
    if (!req.isApiCall) {
      const cookie = req.headers.cookie;

      if (!cookie) {
        throw new UnauthorizedException('Token not found in cookies');
      }
      const token = req.cookies?.Confirmation;

      if (!token) {
        throw new UnauthorizedException('Token not found in cookies');
      }

      const otpVerify = this.jwtService.verify(token);
      const faVerify = this.validate2FA(
        user.user_id,
        user.company_id,
        req?.body?.token,
      );
      const session = await this.sessionService.getSessionByOTPToken(
        payload.sub,
        token,
      );

      if (otpVerify && session && faVerify) {
        const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        const ipAddress = req.headers['x-forwarded-for']
          ? req.headers['x-forwarded-for'][0]
          : '127.0.0.1';
        const geo = geoip.lookup(ipAddress);
        const ua = req.headers['user-agent'];
        const agent = useragent.parse(ua);
        const parser = new UAParser();
        const result = parser.setUA(ua).getResult();
        const dateNow = new Date();
        const expires = new Date(dateNow.getTime() + 7 * 24 * 60 * 60 * 1000);

        const sessionData = {
          source: 'login',
          ip: ipAddress,
          platform: agent.os.toString(),
          browser: agent.toAgent(),
          device_type: agent.device.toString(),
          maker: result.device.vendor || 'Unknown',
          model: result.device.model || 'Unknown',
          city: geo?.city || 'Unknown',
          country: geo?.country || 'Unknown',
          longitude: geo?.longitude || 'Unknown',
          latitude: geo?.latitude || 'Unknown',
          token: refreshToken,
          expires: expires,
        };

        await this.sessionService.updateSession(await session, sessionData);
        const domain = process.env.DOMAIN || '';

        return {
          accessToken,
          refreshToken,
          cookie: `Authentication=${accessToken}; HttpOnly; Path=/; Domain=${domain}; Max-Age=604800; SameSite=Lax`,
          refreshCookie: `Refresh=${refreshToken}; HttpOnly; Path=/; Domain=${domain}; Max-Age=604800; SameSite=Lax`,
        };
      }
    } else {
      const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
      const ipAddress = req.headers['x-forwarded-for']
        ? req.headers['x-forwarded-for'][0]
        : '127.0.0.1';
      const geo = geoip.lookup(ipAddress);
      const ua = req.headers['user-agent'];
      const agent = useragent.parse(ua);
      const parser = new UAParser();
      const result = parser.setUA(ua).getResult();
      const dateNow = new Date();
      const expires = new Date(dateNow.getTime() + 7 * 24 * 60 * 60 * 1000);

      const sessionData = {
        user_id: user.user_id,
        source: 'login',
        ip: ipAddress,
        platform: agent?.os?.toString(),
        browser: agent?.toAgent(),
        device_type: agent?.device ? agent?.device?.toString() : 'Unknown',
        maker: result?.device?.vendor || 'Unknown',
        model: result?.device?.model || 'Unknown',
        city: geo?.city || 'Unknown',
        country: geo?.country || 'Unknown',
        longitude: geo?.longitude || 'Unknown',
        latitude: geo?.latitude || 'Unknown',
        token: refreshToken,
        expires: expires,
      };

      await this.sessionService.createSession(sessionData);
      const domain = process.env.DOMAIN || '';

      return {
        accessToken,
        refreshToken,
        cookie: `Authentication=${accessToken}; HttpOnly; Path=/; Domain=${domain}; Max-Age=604800; SameSite=Lax`,
        refreshCookie: `Refresh=${refreshToken}; HttpOnly; Path=/; Domain=${domain}; Max-Age=604800; SameSite=Lax`,
      };
    }
  }

  async validateToken(@Req() req: Request) {
    try {
      let cookieOld: string | null = null;
      if (!req.isApiCall) {
        cookieOld = req.headers.cookie;

        if (!cookieOld) {
          throw new UnauthorizedException('Token not found in cookies');
        }

        const token = req.cookies?.Authentication;
        const refreshTokenOld = req.cookies?.Refresh;
        const payload = this.jwtService.verify(refreshTokenOld);
        if (
          !token ||
          !(await this.sessionService.isSessionValid(
            payload.sub,
            refreshTokenOld,
            req,
          ))
        ) {
          throw new UnauthorizedException('Invalid session or refresh token');
        }

        const { accessToken, refreshToken, cookie, refreshCookie } =
          await this.refreshTokens(refreshTokenOld, req);
        return {
          token: accessToken,
          refreshToken,
          // cookie: `Authentication=${accessToken}; HttpOnly; Path=/; Domain=${domain}; Max-Age=604800; SameSite=Lax`,
          // refreshCookie: `Refresh=${refreshToken}; HttpOnly; Path=/; Domain=${domain}; Max-Age=604800; SameSite=Lax`,
          cookie,
          refreshCookie,
          valid: true,
          payload,
        };
      } else {
        let authToken: string | null = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          authToken = authHeader.split(' ')[1];
        }

        if (!authToken) {
          throw new UnauthorizedException(
            'Token not found in authorization header',
          );
        }
        const payload = this.jwtStrategy.validateToken(req);
        return { valid: true, payload };
      }
    } catch (error) {
      console.error('Token validation error:', error.message);
      throw new UnauthorizedException('Invalid token or session');
    }
  }

  async refreshTokens(oldRefreshToken: string, @Req() req: Request) {
    try {
      const verifyToken = this.jwtService.verify(oldRefreshToken);
      const user = await this.sessionService.isSessionValid(
        verifyToken.sub,
        oldRefreshToken,
        req,
      );

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const thisUser = await this.userService.findOne(verifyToken.sub);
      const payload = { email: verifyToken.email, sub: verifyToken.sub };
      const accessToken = this.jwtService.sign(payload);
      let refreshToken = oldRefreshToken;
      let refreshCookie = null;
      const session = await this.sessionService.getSession(
        verifyToken.sub,
        oldRefreshToken,
        req,
      );
      const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;
      const domain = process.env.DOMAIN || '';

      if (session && session.expires) {
        const expiresInMillis = new Date(session.expires).getTime();
        const currentTimeInMillis = Date.now();

        if (expiresInMillis - currentTimeInMillis <= FIVE_MINUTES_IN_MS) {
          refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

          const ipAddress = req.headers['x-forwarded-for']
            ? req.headers['x-forwarded-for'][0]
            : '127.0.0.1';
          const geo = geoip.lookup(ipAddress);

          const ua = req.headers['user-agent'];
          const agent = useragent.parse(ua);

          const parser = new UAParser();
          const result = parser.setUA(ua).getResult();
          const dateNow = new Date();
          const expires = new Date(dateNow.getTime() + 7 * 24 * 60 * 60 * 1000);

          const sessionData = {
            user_id: thisUser.user_id,
            source: 'login',
            ip: ipAddress,
            platform: agent.os.toString(),
            browser: agent.toAgent(),
            deviceType: agent.device.toString(),
            maker: result.device.vendor || 'Unknown',
            model: result.device.model || 'Unknown',
            city: geo?.city || 'Unknown',
            country: geo?.country || 'Unknown',
            longitude: geo?.longitude || 'Unknown',
            latitude: geo?.latitude || 'Unknown',
            token: refreshToken,
            expires: expires,
          };

          await this.sessionService.createSession(sessionData);
          await this.sessionService.invalidateSession(
            thisUser.user_id,
            oldRefreshToken,
          );
          refreshCookie = `Refresh=${refreshToken}; HttpOnly; Path=/; Domain=${domain}; Max-Age=604800; SameSite=Lax`;
        }
      }

      return {
        accessToken,
        refreshToken,
        cookie: `Authentication=${accessToken}; HttpOnly; Path=/; Domain=${domain}; Max-Age=604800; SameSite=Lax`,
        refreshCookie: refreshCookie,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async save_fcm(@Req() req: Request) {
    const token = req.body.token
    const user_id = req.body.user_id

    await this.userService.updateFCMToken(user_id, token);
    return true
  }

  async me(@Req() req: Request) {
    try {
      let cookie: string | null = null;
      if (!req.isApiCall) {
        cookie = req.headers.cookie;

        const token = req.cookies?.Authentication;
        const refreshToken = req.cookies?.Refresh;

        const payload = this.jwtService.verify(refreshToken);

        if (payload) {
          //Limit the data that is sent to front end even further
          const { password, ...userInfo } = await this.userService.findOne(
            payload.sub,
          );
          return userInfo;
        }
      } else {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          throw new UnauthorizedException(
            'Authorization token missing or invalid',
          );
        }

        const authToken = authHeader.split(' ')[1];
        const payload = this.jwtService.verify(authToken);

        if (payload) {
          const { password, ...userInfo } = await this.userService.findOne(
            payload.sub,
          );
          return userInfo;
        }
      }
      //Add logic using auth_token if API
    } catch (error) {
      console.error('Token validation error:', error.message);
      throw new UnauthorizedException('Invalid token or session');
    }
  }

  async logout(@Req() req: Request) {
    try {
      let cookie: string | null = null;
      if (!req.isApiCall) {
        cookie = req.headers.cookie;

        if (!cookie) {
          throw new UnauthorizedException('Token not found in cookies');
        }

        const token = req.cookies?.Authentication;
        const refreshToken = req.cookies?.Refresh;
        const payload = this.jwtService.verify(refreshToken);

        const session = await this.sessionService.getSession(
          payload.sub,
          refreshToken,
          req,
        );
        await this.sessionService.invalidateSession(
          session.user_id,
          refreshToken,
        );
      }
    } catch (error) {
      console.error('Token validation error:', error.message);
      throw new UnauthorizedException('Invalid token or session');
    }
  }

  async logoutSession(@Req() req: Request) {
    try {
      let cookie: string | null = null;
      if (!req.isApiCall) {
        cookie = req.headers.cookie;

        if (!cookie) {
          throw new UnauthorizedException('Token not found in cookies');
        }

        const token = req.cookies?.Authentication;
        const refreshToken = req.cookies?.Refresh;
        const payload = this.jwtService.verify(refreshToken);

        await this.sessionService.removeSession(req.body.id);
      }
    } catch (error) {
      console.error('Token validation error:', error.message);
    }
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<boolean> {
    const { old_password, new_password } = changePasswordDto;

    // Fetch the user by ID
    const user = await this.userService.findById(userId);

    // Check if the old password is correct
    const isPasswordValid = await bcrypt.compare(old_password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(
        'Old password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if the new password is the same as the old password
    const isSameAsOldPassword = await bcrypt.compare(
      new_password,
      user.password,
    );
    if (isSameAsOldPassword) {
      throw new HttpException(
        'New password cannot be the same as the old password',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update the user's password
    await this.userService.updatePassword(userId, hashedPassword);

    return true;
  }

  async changeEmail(
    userId: number,
    ChangeEmailDto: ChangeEmailDto,
  ): Promise<boolean> {
    const { old_password, new_email } = ChangeEmailDto;

    // Fetch the user by ID
    const user = await this.userService.findById(userId);

    // Check if the old password is correct
    const isPasswordValid = await bcrypt.compare(old_password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(
        'Old password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update the user's password
    await this.userService.updateEmail(userId, new_email);

    return true;
  }

  async changeStatus(userId: number, reqbody: any): Promise<boolean> {
    const status = reqbody.status;

    // Fetch the user by ID
    const user = await this.userService.findById(userId);
    if (user) {
      // Update the user's password
      await this.userService.updateStatus(userId, status);
      return;
    }

    return true;
  }

  async change2faStatus(userId: string, reqbody: any): Promise<boolean> {
    const status = reqbody.status;

    // Fetch the user by ID
    const user = await this.userService.findUserByUserId(
      userId
    );
    if (user) {
      const secret = speakeasy.generateSecret({ length: 20 });
      // Update the user's password
      const secret_key = !user.authenticator_secret ? secret.base32 : null
      await this.userService.update2fa(user.id, secret_key);
      return;
    }

    return false;
  }

  async updateVerifyPhoneNumber(
    userId: string,
    reqbody: any,
  ): Promise<boolean> {
    const country_code = reqbody.country_code;
    const phone_number = reqbody.phone_number;

    // Fetch the user by ID
    const user = await this.userService.findUserByUserId(userId);
    if (user) {
      // Update the user's password
      await this.userService.updateVerifyPhone(
        user.id,
        country_code,
        phone_number,
      );
      return;
    }

    return true;
  }
}
