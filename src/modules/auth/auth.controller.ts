import {
  Controller,
  Body,
  Get,
  Req,
  Request,
  Post,
  Res,
  UseGuards,
  UnauthorizedException,
  Patch,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreateUserWithProfileDto } from '../user/dto/create-user-with-profile.dto';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { AuthService } from '../auth/auth.service';
import { Response } from 'express';
import { AllowApiCall } from '../../common/decorators/allow-api-call.decorator';
import { AllowPublicCall } from 'src/common/decorators/allow-public-call.decorator';
import { Request as ERequest } from 'express';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @AllowPublicCall()
  @UseGuards(LocalAuthGuard)
  @Post('login_request')
  async loginRequest(
    @Request() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { cookie } = await this.authService.loginRequest(req.user, req);
    const user = await this.userService.findUserByEmailAndPassword(req.body.email, req.body.password);
    response.setHeader('Set-Cookie', [cookie]);
    return { message: 'OTP Sent', user: user.authenticator_secret, active: user.active};
  }

  @AllowPublicCall()
  @Post('verify_2fa')
  async verify2FA(
    @Body('user_id') user_id: string,
    @Body('company_id') company_id: string,
    @Body('authenticator_code') authenticator_code: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Pass the email, company_id, and token to the authService for validation
    const result = await this.authService.validate2FA(
      user_id,
      company_id,
      authenticator_code,
    );

    return result;
  }

  @AllowPublicCall()
  @UseGuards(LocalAuthGuard)
  @AllowApiCall()
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) response: Response) {
    const { accessToken, refreshToken, cookie, refreshCookie } =
      await this.authService.login(req.user, req);
    if (req.isApiCall) {
      return { access_token: accessToken, refresh_token: refreshToken };
    } else {
      response.setHeader('Set-Cookie', [cookie, refreshCookie]);
      return { message: 'Login successful' };
    }
  }

  @AllowPublicCall()
  @AllowApiCall()
  @Post('register')
  async register(@Body() createUserWithProfileDto: CreateUserWithProfileDto) {
    //createUserWithProfileDto.user.email = "michaelaberra9@gmail.com";
    const result = await this.authService.register(createUserWithProfileDto);
    return result;
  }

  @AllowPublicCall()
  @AllowApiCall()
  @Post('start-register')
  async startRegister(@Body() createUserDto: CreateUserDto) {
    const result = await this.authService.startRegister(createUserDto);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Post('validate-token')
  async validateToken(
    @Req() req: ERequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, refreshToken, cookie, refreshCookie, valid } =
      await this.authService.validateToken(req);

    if (!valid) {
      throw new UnauthorizedException('Invalid token');
    }

    if (req.isApiCall) {
      return { access_token: token, refresh_token: refreshToken };
    } else {
      response.setHeader('Set-Cookie', [cookie, refreshCookie]);
      return this.authService.validateToken(req);
    }
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Post('me')
  async me(@Req() req: ERequest) {
    return this.authService.me(req);
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Post('save_fcm')
  async save_fcm(@Req() req: ERequest) {
    return this.authService.save_fcm(req);
  }

  // @UseGuards(JwtAuthGuard)
  // @AllowApiCall()
  // @Post('logout')
  // async logout(
  //   @Req() req: ERequest,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   await this.authService.logout(req);
  //   if (!req.isApiCall) {
  //   }
  // }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Post('logout')
  async logout(
    @Req() req: ERequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(req);

    if (!req.isApiCall) {
      // Clear the cookies by setting their max-age to 0
      response.cookie('Authentication', '', {
        httpOnly: true,
        maxAge: 0, // immediately expire the cookie
        path: '/',
        sameSite: 'lax',
        domain: process.env.DOMAIN || '',
      });

      response.cookie('Refresh', '', {
        httpOnly: true,
        maxAge: 0, // immediately expire the cookie
        path: '/',
        sameSite: 'lax',
        domain: process.env.DOMAIN || '',
      });

      // Optionally, redirect the user or send a logout confirmation
      response.status(200).json({ message: 'Logout successful' });
    } else {
      // For API calls, simply return a success response without redirecting
      response.status(200).json({ message: 'Logout successful' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Post('logoutSession')
  async logoutSession(
    @Req() req: ERequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logoutSession(req);

    if (!req.isApiCall) {
      // Optionally, redirect the user or send a logout confirmation
      response
        .status(200)
        .json({ status: 'success', message: 'Session Logout successful' });
    } else {
      // For API calls, simply return a success response without redirecting
      response
        .status(200)
        .json({ status: 'success', message: 'Session Logout successful' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Patch('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const userId = req['user'].id;
    const result = await this.authService.changePassword(
      userId,
      changePasswordDto,
    );

    if (!result) {
      throw new HttpException(
        'Old password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      status: 'success',
      message: 'Password successfully changed',
    };
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Patch('change-profile-password/:userId')
  async changeProfilePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Param('userId') userId: string,
    @Req() req: Request,
  ) {
    const user = await this.userService.findUserByUserId(userId);
    if (!user) return {
      status: 'false',
      message: 'User does not exist',
    };
    const result = await this.authService.changePassword(
      user.id,
      changePasswordDto,
    );

    if (!result) {
      throw new HttpException(
        'Old password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      status: 'success',
      message: 'Password successfully changed',
    };
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Patch('change-email')
  async changeEmail(
    @Body() ChangeEmailDto: ChangeEmailDto,
    @Req() req: Request,
  ) {
    const userId = req['user'].id;

    const result = await this.authService.changeEmail(userId, ChangeEmailDto);

    if (!result) {
      throw new HttpException(
        'Old password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      status: 'success',
      message: 'Password successfully changed',
    };
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Patch('change-profile-email/:userId')
  async changeProfileEmail(
    @Body() ChangeEmailDto: ChangeEmailDto,
    @Param('userId') userId: string,
    @Req() req: Request,
  ) {
    const user = await this.userService.findUserByUserId(userId);
    if (!user) return {
      status: 'false',
      message: 'User does not exist',
    };
    const result = await this.authService.changeEmail(user.id, ChangeEmailDto);

    if (!result) {
      throw new HttpException(
        'Old password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      status: 'success',
      message: 'Password successfully changed',
    };
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Post('activate/:userId')
  async changeStatus(@Body() reqBody: any, @Param('userId') userId: number) {
    const result = await this.authService.changeStatus(userId, reqBody);

    return {
      status: 'success',
      message: 'Account status had been changed.',
    };
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Post('2fa_status/:userId')
  async change2faStatus(@Body() reqBody: any, @Param('userId') userId: string) {
    const result = await this.authService.change2faStatus(userId, reqBody);

    return {
      status: 'success',
      message: '2fa status had been changed.',
    };
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Post('update-verify-phone/:userId')
  async updateVerifyPhoneNumber(
    @Body() reqBody: any,
    @Param('userId') userId: string,
  ) {
    const result = await this.authService.updateVerifyPhoneNumber(
      userId,
      reqBody,
    );

    return {
      status: 'success',
      message: '2fa status had been changed.',
    };
  }
}
