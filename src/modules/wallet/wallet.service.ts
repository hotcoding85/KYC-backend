import { Injectable } from '@nestjs/common';
import { ThirteenxProviderService } from '../provider/thirteenx/thirteenx.service';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { Asset } from '../asset/entities/asset.entity';
import { Request } from 'express';
@Injectable()
export class WalletService {
  constructor(
    private readonly thirteenxProviderService: ThirteenxProviderService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  async createWallet(
    req: Request,
    user_id: string,
    company_id: string,
    asset?: Asset,
    testnet?: boolean,
  ): Promise<any> {
    const user = await this.authService.me(req);
    const companyUser =
      company_id && user_id
        ? this.userService.findByUserId(user_id, company_id)
        : false;

    await this.thirteenxProviderService.createWallet(
      user,
      companyUser,
      asset,
      testnet,
    );
  }

  async getWallets(
    req: Request,
    user_id: string,
    company_id: string,
  ): Promise<any> {
    const user = await this.authService.me(req);
    
    const companyUser =
      company_id && user_id
        ? this.userService.findByUserId(user_id, company_id)
        : false;
    try {
      return await this.thirteenxProviderService.getWallets(user, companyUser);
    } catch (error) {
      console.log(error);
      throw new Error(error.message || 'Failed to fetch wallets');
    }
  }

  async getNativeBalance(
    req: Request,
    user_id: string,
    company_id: string,
    address: string,
    blockchain?: Asset,
    testnet?: boolean,
  ): Promise<any> {
    const user = await this.authService.me(req);
    const companyUser =
      company_id && user_id
        ? this.userService.findByUserId(user_id, company_id)
        : false;
    try {
      
      return await this.thirteenxProviderService.getNativeBalance(
        user,
        companyUser,
        address,
        blockchain,
      );
    } catch (error) {
      console.log(error);
      throw new Error(error.message || 'Failed to fetch wallets');
    }
  }

  async getTokenBalance(
    req: Request,
    user_id: string,
    company_id: string,
    address: string,
    blockchain?: Asset,
    testnet?: boolean,
  ): Promise<any> {
    const user = await this.authService.me(req);
    const companyUser =
      company_id && user_id
        ? this.userService.findByUserId(user_id, company_id)
        : false;
    try {
      return await this.thirteenxProviderService.getTokenBalance(
        user,
        companyUser,
        address,
        blockchain,
      );
    } catch (error) {
      console.log(error);
      throw new Error(error.message || 'Failed to fetch wallets');
    }
  }
}
