import {
  Controller,
  Get,
  UseGuards,
  Req,
  Query,
  HttpException,
  HttpStatus,
  Post,
  Body,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Ensure the path to JwtAuthGuard is correct
import { Request } from 'express';
import { AllowApiCall } from 'src/common/decorators/allow-api-call.decorator';
import { Asset } from '../asset/entities/asset.entity';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @AllowApiCall()
  @Post('create')
  async createWallet(
    @Req() req: Request,
    @Body()
    body: {
      user_id?: string;
      company_id?: string;
      blockchain?: Asset;
      testnet?: boolean;
    },
  ) {
    const { user_id, company_id, blockchain, testnet } = body;
    try {
      const wallets = await this.walletService.createWallet(
        req,
        user_id,
        company_id,
        blockchain,
        testnet,
      );
      return wallets;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @AllowApiCall()
  @Get('all')
  async getAllWallets(
    @Req() req: Request,
    @Query('user_id') user_id?: string,
    @Query('company_id') company_id?: string,
  ) {
    try {
      console.log(user_id);
      const wallets = await this.walletService.getWallets(
        req,
        user_id || '',
        company_id || '',
      );
      return wallets;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @AllowApiCall()
  @Post('native_balance')
  async getNativeBalance(
    @Req() req: Request,
    @Body()
    body: {
      user_id?: string;
      company_id?: string;
      address?: string;
      blockchain?: Asset;
      testnet?: boolean;
    },
  ) {
    const { user_id, company_id, address, blockchain, testnet } = body;
    try {
      const wallets = await this.walletService.getNativeBalance(
        req,
        user_id,
        company_id,
        address,
        blockchain,
        testnet,
      );
      return wallets;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @AllowApiCall()
  @Post('token_balance')
  async getTokenBalance(
    @Req() req: Request,
    @Body()
    body: {
      user_id?: string;
      company_id?: string;
      address?: string;
      token?: Asset;
      testnet?: boolean;
    },
  ) {
    const { user_id, company_id, address, token, testnet } = body;

    try {
      const wallets = await this.walletService.getTokenBalance(
        req,
        user_id,
        company_id,
        address,
        token,
        testnet,
      );
      return wallets;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
