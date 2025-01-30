import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UtilityService } from 'src/modules/common/utility/utility.service';

@Injectable()
export class ThirteenxProviderService {
  constructor(
    private readonly serviceJwtService: JwtService,
    private readonly utilityService: UtilityService,
  ) {}

  private thirteenxServiceUrl = process.env.WALLET_SERVICE_PROVIDER;

  generateServiceToken(user: any): string {
    const payload = {
      user_id: user.user_id,
      company_id: user.company.company_id,
      service: 'backend',
    };
    return this.serviceJwtService.sign(payload);
  }

  async createCompany(user: any, company: any): Promise<any> {
    try {
      const serviceToken = this.generateServiceToken(user);

      const response = await this.utilityService.eventAPI(
        `${this.thirteenxServiceUrl}/company`,
        {
          name: company.name,
          external_id: company.company_id,
        },
        'POST',
        {
          Authorization: `Bearer ${serviceToken}`,
          'x-api-request': `true`,
        },
      );

      return response;
    } catch (error) {
      throw new BadRequestException(
        `An error occurred while create company account with the provider. ${error}`,
      );
    }
  }

  async createUser(user: any, companyUser: any): Promise<any> {
    const serviceToken = this.generateServiceToken(user);

    const response = await this.utilityService.eventAPI(
      `${this.thirteenxServiceUrl}/user`,
      {
        email: companyUser.email,
        user_id: companyUser.user_id,
        company_id: companyUser.company.company_id,
        role: companyUser.role,
      },
      'POST',
      {
        Authorization: `Bearer ${serviceToken}`,
        'x-api-request': `true`,
      },
    );
    return response;
  }

  async createCustomer(user: any, customer: any): Promise<any> {
    const serviceToken = this.generateServiceToken(user);

    const response = await this.utilityService.eventAPI(
      `${this.thirteenxServiceUrl}/user`,
      {
        email: customer.email,
        user_id: customer.user_id,
        company_id: customer.company.company_id,
        role: customer.role,
      },
      'POST',
      {
        Authorization: `Bearer ${serviceToken}`,
        'x-api-request': `true`,
      },
    );
    return response;
  }

  async createWallet(
    user: any,
    companyUser: any,
    blockchain: any,
    testnet: any,
  ): Promise<any> {
    try {
      const serviceToken = this.generateServiceToken(user);

      const response = await this.utilityService.eventAPI(
        `${this.thirteenxServiceUrl}/wallet/create`,
        {
          mnemonic: '',
          blockchain: blockchain,
          testnet: testnet,
          target_user: companyUser,
        },
        'POST',
        {
          Authorization: `Bearer ${serviceToken}`,
          'x-api-request': 'true',
        },
      );

      return response;
    } catch (error) {
      throw new BadRequestException(
        `An error occurred while create company account with the provider. ${error}`,
      );
    }
  }

  async AddToken(
    user: any,
    companyUser: any,
    wallet: any,
    token: any,
  ): Promise<any> {
    const serviceToken = this.generateServiceToken(user);

    const response = await this.utilityService.eventAPI(
      `${this.thirteenxServiceUrl}/wallet/token`,
      {
        mnemonic: '',
        token: token,
        wallet: wallet,
        target_user: companyUser,
      },
      'POST',
      {
        Authorization: `Bearer ${serviceToken}`,
        'x-api-request': 'true',
      },
    );

    return response;
  }

  async getWallets(user: any, companyUser: any): Promise<any> {
    try {
      const serviceToken = this.generateServiceToken(user);

      const url = `${this.thirteenxServiceUrl}/wallet/all`;
      const response = await this.utilityService.eventAPI(
        url,
        {
          target_user: user || null,
        },
        'POST',
        {
          Authorization: `Bearer ${serviceToken}`,
          'x-api-request': 'true',
        },
      );

      return response;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error.response
        ? new Error(error.response.message || 'Failed to fetch wallets')
        : new Error('Failed to fetch wallets');
    }
  }

  async getWallet(user: any, companyUser: any, address: any): Promise<any> {
    try {
      const serviceToken = this.generateServiceToken(user);

      const url = `${this.thirteenxServiceUrl}/wallet`;
      const response = await this.utilityService.eventAPI(
        url,
        {
          target_user: user || null,
          address: address,
        },
        'POST',
        {
          Authorization: `Bearer ${serviceToken}`,
          'x-api-request': 'true',
        },
      );

      return response;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error.response
        ? new Error(error.response.message || 'Failed to fetch wallets')
        : new Error('Failed to fetch wallets');
    }
  }

  async getTransactionsForUser(user: any, companyUser: any): Promise<any> {
    try {
      const serviceToken = this.generateServiceToken(user);

      const url = `${this.thirteenxServiceUrl}/transaction/all`;
      const response = await this.utilityService.eventAPI(
        url,
        {
          target_user: user || null,
        },
        'POST',
        {
          Authorization: `Bearer ${serviceToken}`,
          'x-api-request': 'true',
        },
      );
      
      return response;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error.response
        ? new Error(error.response.message || 'Failed to fetch tranasctions')
        : new Error('Failed to fetch tranasctions');
    }
  }

  async getTransaction(user: any, companyUser: any, asset: any): Promise<any> {
    try {
      const serviceToken = this.generateServiceToken(user);

      const url = `${this.thirteenxServiceUrl}/transaction`;
      const response = await this.utilityService.eventAPI(
        url,
        {
          target_user: user || null,
          asset: asset,
        },
        'POST',
        {
          Authorization: `Bearer ${serviceToken}`,
          'x-api-request': 'true',
        },
      );

      return response;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error.response
        ? new Error(error.response.message || 'Failed to fetch transactions')
        : new Error('Failed to fetch transactions');
    }
  }

  async getNativeBalance(
    user: any,
    companyUser: any,
    address: any,
    blockchain: any,
  ): Promise<any> {
    try {
      const serviceToken = this.generateServiceToken(user);

      const url = `${this.thirteenxServiceUrl}/wallet/native_balance`;
      const response = await this.utilityService.eventAPI(
        url,
        {
          target_user: companyUser || null,
          blockchain: blockchain,
          address: address,
        },
        'POST',
        {
          Authorization: `Bearer ${serviceToken}`,
          'x-api-request': 'true',
        },
      );
      return response;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error.response
        ? new Error(error.response.message || 'Failed to fetch wallets')
        : new Error('Failed to fetch wallets');
    }
  }

  async getTokenBalance(
    user: any,
    companyUser: any,
    address: any,
    token: any,
  ): Promise<any> {
    try {
      const serviceToken = this.generateServiceToken(user);

      const url = `${this.thirteenxServiceUrl}/wallet/token_balance`;
      const response = await this.utilityService.eventAPI(
        url,
        {
          target_user: companyUser || null,
          token: token,
          address: address,
        },
        'POST',
        {
          Authorization: `Bearer ${serviceToken}`,
          'x-api-request': 'true',
        },
      );

      return response;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error.response
        ? new Error(error.response.message || 'Failed to fetch wallets')
        : new Error('Failed to fetch wallets');
    }
  }

  async estimateGas(
    user: any,
    companyUser: any,
    blockchain: any,
    to: string,
    from: string,
    amount: number,
  ): Promise<any> {
    try {
      const serviceToken = this.generateServiceToken(user);
      const url = `${this.thirteenxServiceUrl}/transaction/estimate_gas`;
      const response = await this.utilityService.eventAPI(
        url,
        {
          blockchain: blockchain,
          to: to,
          from: from,
          amount: amount,
          target_user: companyUser || null,
        },
        'POST',
        {
          Authorization: `Bearer ${serviceToken}`,
          'x-api-request': 'true',
        },
      );
      return response;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error.response
        ? new Error(error.response.message || 'Failed to fetch wallets')
        : new Error('Failed to fetch wallets');
    }
  }

  async estimateExecutionGas(
    user: any,
    companyUser: any,
    token: any,
    to: string,
    from: string,
    amount: number,
  ): Promise<any> {
    try {
      const serviceToken = this.generateServiceToken(user);
      const url = `${this.thirteenxServiceUrl}/transaction/estimate_execution_gas`;
      

      const response = await this.utilityService.eventAPI(
        url,
        {
          token: token,
          to: to,
          from: from,
          amount: amount,
          target_user: companyUser || null,
        },
        'POST',
        {
          Authorization: `Bearer ${serviceToken}`,
          'x-api-request': 'true',
        },
      );
      return response;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error.response
        ? new Error(error.response.message || 'Failed to fetch wallets')
        : new Error('Failed to fetch wallets');
    }
  }

  async sendNativeCurrency(
    user: any,
    companyUser: any,
    blockchain: any,
    to: string,
    from: string,
    amount: number,
    chain_fee?: number,
    platform_fee?: number,
    company_fee?: number,
  ): Promise<any> {
    try {
      const serviceToken = this.generateServiceToken(user);

      const url = `${this.thirteenxServiceUrl}/transaction/send/native_currency`;
      const response = await this.utilityService.eventAPI(
        url,
        {
          blockchain: blockchain,
          to: to,
          from: from,
          amount: amount,
          target_user: companyUser || null,
          chain_fee: chain_fee,
          platform_fee: platform_fee,
          company_fee: company_fee,
        },
        'POST',
        {
          Authorization: `Bearer ${serviceToken}`,
          'x-api-request': 'true',
        },
      );

      return response;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error.response
        ? new Error(error.response.message || 'Failed to fetch wallets')
        : new Error('Failed to fetch wallets');
    }
  }

  async sendTokenCurrency(
    user: any,
    companyUser: any,
    token: any,
    to: string,
    from: string,
    amount: number,
    chain_fee?: number,
    platform_fee?: number,
    company_fee?: number,
  ): Promise<any> {
    try {
      const serviceToken = this.generateServiceToken(user);

      const url = `${this.thirteenxServiceUrl}/transaction/send/token_currency`;
      const response = await this.utilityService.eventAPI(
        url,
        {
          token: token,
          to: to,
          from: from,
          amount: amount,
          target_user: companyUser || null,
          chain_fee: chain_fee,
          platform_fee: platform_fee,
          company_fee: company_fee,
        },
        'POST',
        {
          Authorization: `Bearer ${serviceToken}`,
          'x-api-request': 'true',
        },
      );

      return response;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error.response
        ? new Error(error.response.message || 'Failed to fetch wallets')
        : new Error('Failed to fetch wallets');
    }
  }

  async stats(user: any, companyUser: any): Promise<any> {
    try {
      const serviceToken = this.generateServiceToken(user);

      const url = `${this.thirteenxServiceUrl}/transaction/stats`;
      const response = await this.utilityService.eventAPI(
        url,
        {
          target_user: companyUser || null,
        },
        'POST',
        {
          Authorization: `Bearer ${serviceToken}`,
          'x-api-request': 'true',
        },
      );

      return response;
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw error.response
        ? new Error(
            error.response.message || 'Failed to fetch transaction stats',
          )
        : new Error('Failed to fetch transaction stats');
    }
  }
}
