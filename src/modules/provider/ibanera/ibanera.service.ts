import { Injectable } from '@nestjs/common';
import { TOTP } from 'totp-generator';
import axios from 'axios';

@Injectable()
export class IbaneraProviderService {
  constructor() {}

  private authToken: string | null = null;
  private tokenExpiry: number | null = null;
  private ibaneraServiceUrl = process.env.IBANERA_SERVICE_PROVIDER;
  private ibaneraServicePublicUrl = process.env.IBANERA_SERVICE_PROVIDER_PUBLIC;

  async generateOTPToken(): Promise<any> {
    const { otp } = TOTP.generate(process.env.IBANERA_JWT_SECRET, {
      digits: 6,
      algorithm: 'SHA-1',
      period: 30,
      timestamp: Date.now(),
    });

    return otp;
  }

  async login(otpToken: string): Promise<string> {
    const ibaneraAuthUrl = `${process.env.IBANERA_SERVICE_PROVIDER}/api/v1/public/auth/login`;
    const loginResponse = await axios.post(`${ibaneraAuthUrl}`, {
      username: process.env.IBANERA_USERNAME,
      password: process.env.IBANERA_PASSWORD,
      otp: otpToken,
    });

    this.authToken = loginResponse?.data?.details?.accessToken;
    this.tokenExpiry =
      Date.now() + Number(loginResponse?.data?.details?.expiresIn) * 1000;
    return this.authToken;
  }

  async getAuthToken(): Promise<any> {
    const otpToken = await this.generateOTPToken();
    if (this.authToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return {
        otp: otpToken,
        authToken: this.authToken,
      };
    }

    return {
      otp: await this.generateOTPToken(),
      authToken: await this.login(otpToken),
    };
  }

  async call(url: string, body: any, method: 'POST' | 'GET'): Promise<any> {
    try {
      let response;
      const auth = await this.getAuthToken();

      switch (method) {
        case 'POST':
          response = await axios.post(`${this.ibaneraServiceUrl}${url}`, body, {
            headers: {
              Authorization: `Bearer ${auth?.authToken}`,
              otp: `${auth?.otp}`,
            },
          });
          break;
        case 'GET':
          response = await axios.get(`${this.ibaneraServiceUrl}${url}`, {
            params: body,
            headers: {
              Authorization: `Bearer ${auth?.authToken}`,
              otp: `${auth?.otp}`,
            },
          });
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      return response.data;
    } catch (error: any) {
      console.error('API Call Error:', {
        url: `${this.ibaneraServiceUrl}${url}`,
        method,
        body,
        error: error.response?.data || error.message || 'Unknown error',
        error_detail: error.response?.data?.errors,
      });
      throw error;
    }
  }

  async deposit(account_id) {
    const body = {
      DestinationAccountId: account_id,
      TransferType: 'SWIFT',
      Amount: 100,
    };

    const response = await this.call(
      '/api/v1/customer/simulations/payins',
      body,
      'POST',
    );

    return response.data;
  }

  async compliance() {
    const response = await this.call(
      '/api/v1/customer/cards/compliancefields',
      {},
      'GET',
    );
    console.log(response);
    return response.data;
  }

  async createAccount(customer_id: string, asset_name: string) {
    try {
      const body = {
        CustomersId: customer_id,
        Name: `${asset_name} Account`,
        Asset: asset_name,
      };
      const response = await this.call(
        '/api/v2/customer/accounts/create',
        body,
        'POST',
      );

      return response?.details;
    } catch (error) {
      console.error('Could not create account on ibanera', error);
    }
  }

  async createCard(customer_id: string, asset_name: string) {
    try {
      const body = {
        customersId: customer_id,
        currency: asset_name,
        customerSubtype: '1',
        businessActivityType: '878',
        occupationType: '11',
        sourceOfFundsType: '1936',
      };
      const response = await this.call(
        '/api/v1/customer/cards/create',
        body,
        'POST',
      );

      return response?.details;
    } catch (error) {
      console.error('Could not create account on ibanera', error);
    }
  }

  async createAddress(account_id: string) {
    const body = {
      accountsId: account_id,
    };

    const response = await this.call(
      '/api/v1/customer/accounts/crypto/depositaddress',
      body,
      'POST',
    );

    return response.data;
  }

  async listManagee() {
    try {
      const response = await this.call(
        '/api/v2/customer/managees/list',
        {
          PageSize: '80',
        },
        'GET',
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  async listAccount(customer_id: string) {
    try {
      const response = await this.call(
        '/api/v1/customer/accounts/list-accounts',
        {
          PageSize: '40',
          CustomersId: customer_id,
        },
        'GET',
      );
      console.log(response);
      return response?.details;
    } catch (error) {
      console.log(error);
    }
  }


  async getAccount(account_id: string) {
    try {
      const transaction = await this.call(
        `/api/v1/customer/accounts/transactions?AccountsId=${account_id}`,
        {},
        'GET',
      );

      console.log(transaction);

      const account = await this.call(
        `/api/v1/customer/accounts/account`,
        {
          id: account_id,
        },
        'GET',
      );
      console.log(account);
      if (account?.details) {
        return {
          ...account,
          transaction: transaction,
        };
      }
    } catch (error) {
      console.log(error);
    }
  }

  async generateAddress(account_id: string) {
    try {
      const address = await this.call(
        `/api/v1/customer/accounts/crypto/depositaddress`,
        {
          AccountsId: account_id,
        },
        'GET',
      );
      console.log(address);
      if (address?.details) {
        return address;
      }
    } catch (error) {
      //console.log(error);
    }
  }

  async getTransaction(account_id: string) {
    try {
      const transaction = await this.call(
        `/api/v1/customer/accounts/transactions?AccountsId=${account_id}`,
        {},
        'GET',
      );
      console.log(transaction);
      if (transaction?.details) {
        return transaction?.details;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async internal(
    type: ['FIAT', 'DIGITAL'],
    account_id: string,
    amount: number,
    destination: string,
    reference: string,
  ) {
    const body = {
      SourceAccountId: account_id,
      DestinationAccountId: destination,
      Amount: amount,
      Reference: reference,
    };

    const response = await this.call(
      '/api/v1/customer/transfers/fiat/createinternaltransfer',
      body,
      'POST',
    );

    return response.data;
  }

  async getBankDetails(swiftCode: string) {
    const response = await this.call(
      '/api/v1/customer/transfers/lookupbankdetails',
      {
        SwiftCode: swiftCode,
      },
      'GET',
    );

    return response.data;
  }

  async external(
    account_id: string,
    amount: number,
    destination: any,
    reference: string,
  ) {
    //const bankDetails = await this.getBankDetails(destination?.swift);
    const body = {
      SourceAccountId: account_id,
      TransferType: 'Wire',
      Payee: {
        CountryCode: 'USA',
        SwiftCode: destination.swift,
        IntermediaryBic: 'XXXX',
        AccountNumber: destination.account_number,
        AccountName: 'Michael',
        Type: 'Individual',
        Name: 'Michael',
        AddressLine1: 'Dubai',
        TownCity: 'Dubai',
        Postcode: '00000',
      },
      Originator: {
        CompanyId: null,
        Name: 'Michael',
        AddressLine1: 'Dubai',
        AddressLine2: 'Dubai',
        AddressLine3: 'Dubai',
        Data: null,
      },
      bSavePayee: false,
      Amount: amount,
      Reference: reference,
      PurposeCode: 'PUC002',
    };

    const response = await this.call(
      '/api/v3/customer/transfers/fiat/createexternaltransfer',
      body,
      'POST',
    );

    return response.data;
  }

  async withdraw(account_id: string, amount: number, address: string) {
    const body = {
      accountsId: account_id,
      amount: amount,
      destinationAddress: address,
    };

    const response = await this.call(
      '/api/v1/customer/accounts/crypto/withdraw',
      body,
      'POST',
    );

    return response.data;
  }

  async createCustomer(data: any, user_id: string, company_id: string) {
    try {
      const response = await this.call(
        '/api/v5/customer/managees/create',
        {
          AddressCountryISO: data?.profile?.country,
          addressLine1: data?.profile?.address,
          dateOfBirth:
            data?.profile?.dob?.split('/').reverse().join('-') || '1970-01-01',
          emailAddress: data?.user?.email,
          fiatCurrencyCode: 'USD',
          firstGivenName: data?.user?.first_name,
          fullName: `${data?.user?.first_name} ${data?.user?.last_name}`,
          lastSurname: data?.user?.last_name,
          manageesReference: user_id,
          nationalityISO: data?.profile?.nationality,
          occupation: data?.profile?.occupation,
          phoneNumber: `${data?.profile?.phone}`,
          postcode: data?.profile?.zip,
          proofOfAddressFile:
            data?.profile?.proofOfAddressDocument.split(',').pop() || null,
          ProofOfAddressType: data?.profile?.poa || 'PhoneBill',
          StateProvince: data?.profile?.state || 'NA',
          taxNumber: data?.profile?.tax,
          townCity: data?.profile?.city,
          EstimatedNetWorth: parseInt(data?.onboarding?.netWorth || 0),
          EstimatedGrossAnnualIncome: parseInt(
            data?.onboarding?.annualIncome || 0,
          ),
          OtherBanks: [data?.onboarding?.bankName],
          bActivelyEmployed: data?.onboarding?.employed,
          EmployedCompanyName: data?.onboarding?.employerName,
          EmployedJobTitle: data?.onboarding?.jobTitle,
          PurposeOfOpeningAccountTypes: [
            data?.onboarding?.purposeOfAccountOpening,
          ],
          MonthlyTurnover: parseInt(data?.onboarding?.monthlyTurnover || 0),
          AnticipatedTransactionActivity: parseInt(
            data?.onboarding?.transactionActivity || 0,
          ),
          PurchaseCryptoMonthlyVolume: parseInt(
            data?.onboarding?.purchaseMonthlyCrypto || 0,
          ),
          PurchaseCryptoAverageAmount: parseInt(
            data?.onboarding?.purchaseAverageCrypto || 0,
          ),
          PurchaseCryptoTotalAmountPerMonth:
            parseInt(data?.onboarding?.purchaseMonthlyCrypto || 0) +
            parseInt(data?.onboarding?.purchaseAverageCrypto || 0),
          SellingCryptoAverageAmount: parseInt(
            data?.onboarding?.sellAverageCrypto || 0,
          ),
          SellingCryptoMonthlyVolume: parseInt(
            data?.onboarding?.sellMonthlyCrypto || 0,
          ),
          SellingCryptoTotalAmountPerMonth:
            parseInt(data?.onboarding?.sellMonthlyCrypto || 0) +
            parseInt(data?.onboarding?.sellAverageCrypto || 0),
          TotalMonthlyVolume:
            parseInt(data?.onboarding?.purchaseMonthlyCrypto || 0) +
            parseInt(data?.onboarding?.sellMonthlyCrypto || 0),
          TotalAverageAmount:
            (parseInt(data?.onboarding?.purchaseAverageCrypto || 0) +
              parseInt(data?.onboarding?.sellAverageCrypto || 0)) /
            2,
          TotalMonthlyAmount:
            parseInt(data?.onboarding?.purchaseMonthlyCrypto || 0) +
            parseInt(data?.onboarding?.sellMonthlyCrypto || 0),
          BtcTradingPercentage: parseInt(data?.onboarding?.bitcoinTrading || 0),
          EthTradingPercentage: parseInt(
            data?.onboarding?.ethereumTrading || 0,
          ),
          UsdcTradingPercentage: parseInt(data?.onboarding?.tetherTrading || 0),
          OtherCoinsTradingPercentage: parseInt(
            data?.onboarding?.otherTrading || 0,
          ),
          SourceFundsTypes: [data?.onboarding?.sourceOfFunds],
          bIrsTax: data?.onboarding?.irsConfirm,
          bForeignAccountTax: data?.onboarding?.factaConfirm,
          bNotCriminal: data?.onboarding?.criminalConfirm,
          bAccurateInfo: data?.onboarding?.accurateConfirm,
        },
        'POST',
      );

      console.log('JUMIO LINKKKKKKKK');
      console.log(response);

      return response;
    } catch (error: any) {
      console.error('API Call Error:', {
        error: error.response?.data || error.message || 'Unknown error',
        error_detail: error.response?.data?.errors,
      });
      throw error;
    }
  }
}
