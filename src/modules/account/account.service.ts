import { Injectable, NotFoundException, Req } from '@nestjs/common';
import { Raw, Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAccountDto } from './dtos/create-account.dto';
import { Company } from '../company/entities/company.entity';
import { User } from '../user/entities/user.entity';
import { Asset } from '../asset/entities/asset.entity';
import { Network } from '../asset-networks/entity/networks.entity';
import { UpdateAccountDto } from './dtos/update-account.dto';
import { IbaneraProviderService } from '../provider/ibanera/ibanera.service';
import { ThirteenxProviderService } from '../provider/thirteenx/thirteenx.service';
import { UtilityService } from '../common/utility/utility.service';
import { MarketService } from '../market/market.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserAccountDto } from './dtos/user-account.dto';

import { ASSET_TYPE, COMPANY_ACCOUNT_TYPE, ROLE } from 'src/lib/enums';
import { Transaction } from '../transaction/entities/transaction.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRespository: Repository<Account>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    @InjectRepository(Network)
    private readonly networkRespository: Repository<Network>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,

    private jwtService: JwtService,
    private readonly marketService: MarketService,
    private readonly utilityService: UtilityService,
    private readonly ibaneraProviderService: IbaneraProviderService,
    private readonly thirteenxProviderService: ThirteenxProviderService,
  ) {}

  async testIbanera() {
    console.log('Ibanera');
    try {
      const result = await this.ibaneraProviderService.generateAddress('6403');
      return result;
    } catch (error) {
      console.error(error);
    }
  }

  async addAccount(@Req() req: Request, asset_id: string): Promise<Account> {
    const me = await this.utilityService.me(req, this.jwtService);
    if (me) {
      const user = await this.userRepository.findOne({
        where: { id: me },
      });

      const asset = await this.assetRepository.findOne({
        where: { asset_id: asset_id },
      });

      try {
        const accounts = await this.ibaneraProviderService.createAccount(
          user.external_id,
          asset.ticker,
        );
        if (accounts) {
          const newAccount = accounts?.accounts[0];

          const accountDetail = {
            routing_number: newAccount?.routingNumber || '',
            swift: newAccount?.swiftCode || '',
            account_id: newAccount?.id || '',
            virtual_account_number: newAccount?.virtualAccountNumber || '',
          };

          let account_number = newAccount?.accountNumber;

          if (
            asset.type === ASSET_TYPE.TOKEN ||
            asset.type === ASSET_TYPE.CRYPTOCURRENCY
          ) {
            const address = await this.ibaneraProviderService.generateAddress(
              newAccount?.id,
            );

            account_number = address?.details?.address || '';
          }

          const accountData = {
            asset,
            user,
            account_number: account_number || '',
            account_detail: accountDetail,
            network: null,
          };

          const checkAccount = await this.accountRespository.findOne({
            where: {
              account_detail: Raw(
                (alias) => `${alias} ->> 'account_id' = :accountId`,
                { accountId: newAccount?.id },
              ),
            },
          });

          if (!checkAccount) {
            const account = this.accountRespository.create(accountData);
            return await this.accountRespository.save(account);
          } else {
            const updatedAccount = this.accountRespository.merge(
              checkAccount,
              accountData,
            );
            return await this.accountRespository.save(updatedAccount);
          }
        } else {
          console.error('Error creating account:', accounts);
          throw new Error('Failed to create account');
        }
      } catch (error) {
        console.error('Error creating account:', error);
        throw new Error('Failed to create account');
      }
    }
  }

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const company = await this.companyRepository.findOne({
      where: {
        company_id: createAccountDto.company_id,
      },
      relations: ['users'],
    });

    if (!company) {
      throw new NotFoundException(
        `company with id ${createAccountDto.company_id} does not exists`,
      );
    }

    const asset = await this.assetRepository.findOne({
      where: {
        asset_id: createAccountDto.asset_id,
      },
    });

    if (!asset) {
      throw new NotFoundException(
        `asset with id ${createAccountDto.asset_id} does not exists`,
      );
    }

    let network;

    if (createAccountDto?.network_id) {
      network = await this.networkRespository.findOne({
        where: {
          network_id: createAccountDto?.network_id,
          asset: { asset_id: createAccountDto.asset_id },
        },
      });

      if (!network) {
        throw new NotFoundException(
          `network with id ${createAccountDto.network_id} does not exists`,
        );
      }
    }

    let ownerUser;
    if (!createAccountDto?.user_id) {
      ownerUser = await company.users.find(
        (user) => user.role === ROLE.COMPANY_ADMINISTRATOR,
      );
    } else {
      ownerUser = await this.userRepository.findOne({
        where: {
          user_id: createAccountDto.user_id,
        },
      });
    }

    const account = await this.accountRespository.create({
      asset: asset,
      user: ownerUser,
      account_number: createAccountDto.account_number,
      account_detail: createAccountDto.account_detail,
      network: network || null,
    });

    return await this.accountRespository.save(account);
  }

  async findAll(): Promise<Account[]> {
    return await this.accountRespository.find({
      relations: {
        user: true,
        asset: true,
        network: true,
      },
    });
  }

  async findOne(accountId: string): Promise<Account> {
    const account = await this.accountRespository.findOne({
      where: { account_id: accountId },
      relations: {
        user: true,
        network: true,
        asset: true,
      },
    });
    if (!account) {
      throw new NotFoundException(`Account with ID "${accountId}" not found`);
    }
    return account;
  }

  async update(
    accountId: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    const account = await this.findOne(accountId);
    Object.assign(account, updateAccountDto);
    return await this.accountRespository.save(account);
  }

  async remove(id: string): Promise<void> {
    const result = await this.accountRespository.delete({ account_id: id });
    if (result.affected === 0) {
      throw new NotFoundException(`Account with ID "${id}" not found`);
    }
  }

  async getAccountsForCompany(companyId: string): Promise<Account[]> {
    const company = await this.companyRepository.findOne({
      where: {
        company_id: companyId,
      },
      relations: ['users'],
    });

    if (!company) {
      throw new NotFoundException(
        `company with id ${companyId} does not exists`,
      );
    }

    const companyAdmin = company.users.find(
      (user) => user.role === ROLE.COMPANY_ADMINISTRATOR,
    );

    return await this.accountRespository.find({
      where: {
        user: {
          id: companyAdmin.id,
        },
      },
      relations: {
        user: true,
        asset: true,
        network: true,
      },
    });
  }

  async updateBalance(
    user: User,
    asset: Asset,
    network: Network,
    newBalance: number,
  ): Promise<void> {
    const account = await this.accountRespository.findOne({
      where: {
        user: { id: user.id },
        asset: { id: asset.id },
        network: { id: network?.id || null },
      },
    });

    if (account) {
      account.balance = newBalance;
      await this.accountRespository.save(account);
    } else {
      console.warn(
        `Account not found for user ${user.id}, asset ${asset.id}, network ${network?.id || 'null'}`,
      );
    }
  }

  async getDepositAddress(
    @Req() req: Request,
    account_id: string,
  ): Promise<string> {
    const me = await this.utilityService.me(req, this.jwtService);
    if (me) {
      const user = await this.userRepository.findOne({
        where: { id: me },
        relations: ['accounts', 'accounts.asset', 'company'],
      });
      if (!user) {
        throw new NotFoundException(`Account can not be accessed`);
      }

      const account = await this.accountRespository.findOne({
        where: {
          account_id: account_id,
        },
        relations: ['asset', 'network'],
      });

      const account_detail = account?.account_detail || '{}';
      if (
        user.company.company_account_type == COMPANY_ACCOUNT_TYPE.WEB3 ||
        user.company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
      ) {
      } else if (
        user.company.company_account_type == COMPANY_ACCOUNT_TYPE.BANKING ||
        user.company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
      ) {
        const address = await this.ibaneraProviderService.generateAddress(
          account_detail?.account_id,
        );

        const updateAccountDto: UpdateAccountDto = {};

        try {
          updateAccountDto.account_number = address?.details?.address;
        } catch (error) {
          throw new Error('Invalid JSON in existing account_detail');
        }

        Object.assign(account, updateAccountDto);
        await this.accountRespository.save(account);
        return address;
      }
    }
  }

  async getAccounts(@Req() req: Request): Promise<UserAccountDto[]> {
    const me = await this.utilityService.me(req, this.jwtService);
    if (me) {
      const user = await this.userRepository.findOne({
        where: { id: me },
        relations: [
          'company',
          'accounts',
          'accounts.asset',
          'accounts.network',
        ],
      });
      if (!user) {
        throw new NotFoundException(`Account can not be accessed`);
      }

      if (
        user.company.company_account_type == COMPANY_ACCOUNT_TYPE.WEB3 ||
        user.company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
      ) {
        let totalBalanceUSD = 0;
        const accountsWithUSD = await Promise.all(
          user.accounts.map(async (account) => {
            const blockchainName = account?.asset?.name;
            const coinDetail =
              await this.marketService.getCoinDetail(blockchainName);
            const balance = account.balance;
            const currentPrice = parseFloat(
              coinDetail?.market_data?.current_price?.usd,
            );
            const balanceUSD = balance * currentPrice;

            totalBalanceUSD += balanceUSD;

            return {
              account,
              balanceUSD,
              currentPrice,
              coinDetail,
            };
          }),
        );

        const enrichedAccounts = accountsWithUSD.map(
          ({ account, balanceUSD, currentPrice, coinDetail }) => {
            const portfolioPercent =
              totalBalanceUSD > 0 ? (balanceUSD / totalBalanceUSD) * 100 : 0;
            return new UserAccountDto({
              id: `${account?.account_id}`,
              icon: `${account?.asset?.icon}`,
              assetType: `${account?.asset.type}`,
              asset: `${account?.asset?.name}`,
              ticker: `${account?.asset?.ticker}`,
              network:
                account?.asset?.type == ASSET_TYPE.TOKEN
                  ? account?.network
                  : null,
              network_icon: `${account?.asset?.type == ASSET_TYPE.TOKEN ? account?.network?.icon : ''}`,
              address: `${account?.account_number}`,
              marketCap: this.utilityService.formatLargeNumber(
                coinDetail?.market_data?.market_cap?.usd,
              ),
              price: `${currentPrice.toFixed(2)}`,
              priceChange: (
                (parseFloat(coinDetail?.market_data?.price_change_24h) * 100) /
                currentPrice
              ).toFixed(2),
              balance: Number(account.balance).toFixed(4),
              balanceUSD: `${balanceUSD.toFixed(2)}`,
              portfolioPercent: `${portfolioPercent.toFixed(2) || 0}%`,
              valueUSD: `${balanceUSD.toFixed(2)}`,
              transactions: {},
            });
          },
        );

        return enrichedAccounts;
      } else if (
        user.company.company_account_type == COMPANY_ACCOUNT_TYPE.BANKING ||
        user.company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
      ) {
        if (user.accounts) {
          const enrichedAccounts = await Promise.all(
            user.accounts.map(async (account) => {
              return new UserAccountDto({
                id: `${account?.account_id}`,
                icon: `${account?.asset?.icon}`,
                assetType: `${account?.asset?.type}`,
                asset: `${account?.asset?.name}`,
                ticker: `${account?.asset?.ticker}`,
                network:
                  account?.asset?.type == ASSET_TYPE.TOKEN
                    ? account?.network
                    : [account?.account_detail],
                network_icon: `${account?.asset?.type == ASSET_TYPE.TOKEN ? account?.network?.icon : ''}`,
                address: `${account?.account_number}`,
                marketCap: '0',
                price: '0',
                priceChange: '0',
                balance: Number(account?.balance).toFixed(4),
                balanceUSD: '0',
                portfolioPercent: '0%',
                valueUSD: '0%',
                transactions: {},
              });
            }),
          );

          return enrichedAccounts;
        }
      }
    }
    return [];
  }

  async getAccountsForUser(
    @Req() req: Request,
    user_id: string,
  ): Promise<UserAccountDto[]> {
    const me = await this.utilityService.me(req, this.jwtService);
    if (me) {
      const requester = await this.userRepository.findOne({
        where: { id: me },
      });

      const user = await this.userRepository.findOne({
        where: { user_id: user_id },
        relations: [
          'company',
          'accounts',
          'accounts.asset',
          'accounts.network',
        ],
      });

      if (
        requester.role == ROLE.SUPER_ADMINISTRATOR ||
        requester.role == ROLE.SUPER_USER ||
        (requester.role == ROLE.COMPANY_ADMINISTRATOR &&
          requester.company == user.company)
      ) {
        if (!user) {
          throw new NotFoundException(`Account can not be accessed`);
        }

        if (
          user.company.company_account_type == COMPANY_ACCOUNT_TYPE.WEB3 ||
          user.company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
        ) {
          let totalBalanceUSD = 0;
          const accountsWithUSD = await Promise.all(
            user.accounts.map(async (account) => {
              const blockchainName = account?.asset?.name;
              const coinDetail =
                await this.marketService.getCoinDetail(blockchainName);
              const balance = account.balance;
              const currentPrice = parseFloat(
                coinDetail?.market_data?.current_price?.usd,
              );
              const balanceUSD = balance * currentPrice;

              totalBalanceUSD += balanceUSD;

              return {
                account,
                balanceUSD,
                currentPrice,
                coinDetail,
              };
            }),
          );

          const enrichedAccounts = accountsWithUSD.map(
            ({ account, balanceUSD, currentPrice, coinDetail }) => {
              const portfolioPercent =
                totalBalanceUSD > 0 ? (balanceUSD / totalBalanceUSD) * 100 : 0;
              return new UserAccountDto({
                id: `${account?.account_id}`,
                icon: `${account?.asset?.icon}`,
                assetType: `${account?.asset.type}`,
                asset: `${account?.asset?.name}`,
                ticker: `${account?.asset?.ticker}`,
                network:
                  account?.asset?.type == ASSET_TYPE.TOKEN
                    ? account?.network
                    : null,
                network_icon: `${account?.asset?.type == ASSET_TYPE.TOKEN ? account?.network?.icon : ''}`,
                address: `${account?.account_number}`,
                marketCap: this.utilityService.formatLargeNumber(
                  coinDetail?.market_data?.market_cap?.usd,
                ),
                price: `${currentPrice.toFixed(2)}`,
                priceChange: (
                  (parseFloat(coinDetail?.market_data?.price_change_24h) *
                    100) /
                  currentPrice
                ).toFixed(2),
                balance: Number(account.balance).toFixed(4),
                balanceUSD: `${balanceUSD.toFixed(2)}`,
                portfolioPercent: `${portfolioPercent.toFixed(2) || 0}%`,
                valueUSD: `${balanceUSD.toFixed(2)}`,
                transactions: {},
              });
            },
          );

          return enrichedAccounts;
        } else if (
          user.company.company_account_type == COMPANY_ACCOUNT_TYPE.BANKING ||
          user.company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
        ) {
          if (user.accounts) {
            const enrichedAccounts = await Promise.all(
              user.accounts.map(async (account) => {
                return new UserAccountDto({
                  id: `${account?.account_id}`,
                  icon: `${account?.asset?.icon}`,
                  assetType: `${account?.asset?.type}`,
                  asset: `${account?.asset?.name}`,
                  ticker: `${account?.asset?.ticker}`,
                  network:
                    account?.asset?.type == ASSET_TYPE.TOKEN
                      ? account?.network
                      : [account?.account_detail],
                  network_icon: `${account?.asset?.type == ASSET_TYPE.TOKEN ? account?.network?.icon : ''}`,
                  address: `${account?.account_number}`,
                  marketCap: '0',
                  price: '0',
                  priceChange: '0',
                  balance: Number(account?.balance).toFixed(4),
                  balanceUSD: '0',
                  portfolioPercent: '0%',
                  valueUSD: '0%',
                  transactions: {},
                });
              }),
            );

            return enrichedAccounts;
          }
        }
      }
    }
    return [];
  }

  async getAccount(
    @Req() req: Request,
    account_id: string,
  ): Promise<UserAccountDto> {
    const me = await this.utilityService.me(req, this.jwtService);
    if (me) {
      const user = await this.userRepository.findOne({
        where: { id: me },
        relations: ['accounts', 'accounts.asset', 'company'],
      });
      if (!user) {
        throw new NotFoundException(`Account can not be accessed`);
      }

      const account = await this.accountRespository.findOne({
        where: {
          account_id: account_id,
        },
        relations: ['asset', 'network'],
      });
      if (
        user.company.company_account_type == COMPANY_ACCOUNT_TYPE.WEB3 ||
        user.company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
      ) {
        const transactions = await this.thirteenxProviderService.getTransaction(
          user,
          user.company,
          account.asset.name,
        );

        const blockchainName = account?.asset?.name;
        const coinDetail =
          await this.marketService.getCoinDetail(blockchainName);

        const balance = account.balance;
        const currentPrice = parseFloat(
          coinDetail?.market_data?.current_price?.usd,
        );
        const balanceUSD = balance * currentPrice;
        const portfolioPercent = 0;

        let networkWithUSD = {};

        if (account?.asset?.type === ASSET_TYPE.TOKEN) {
          console.log(user.accounts, account?.network?.name);
          networkWithUSD = await Promise.all(
            user.accounts
              .filter((a) => a?.asset?.name === account?.network?.name) // Filter for matching network
              .map(async (a) => {
                const blockchainName = a?.asset?.name;
                const coinDetail =
                  await this.marketService.getCoinDetail(blockchainName);
                const balance = a.balance;
                const currentPrice = parseFloat(
                  coinDetail?.market_data?.current_price?.usd || 0,
                );
                const balanceUSD = balance * currentPrice;

                return {
                  account: a,
                  balance,
                  balanceUSD,
                  currentPrice,
                  coinDetail,
                };
              }),
          );
        }

        return new UserAccountDto({
          id: `${account?.account_id}`,
          icon: `${account?.asset?.icon}`,
          assetType: `${account?.asset.type}`,
          asset: `${account?.asset?.name}`,
          ticker: `${account?.asset?.ticker}`,
          network:
            account?.asset?.type === ASSET_TYPE.TOKEN
              ? {
                  ...account.network,
                  ...networkWithUSD[0],
                }
              : null,
          network_icon:
            account?.asset?.type == ASSET_TYPE.TOKEN
              ? account?.network?.icon
              : '',
          address: `${account?.account_number}`,
          marketCap: this.utilityService.formatLargeNumber(
            coinDetail?.market_data?.market_cap?.usd,
          ),
          price: `${currentPrice.toFixed(2)}`,
          priceChange: (
            (parseFloat(coinDetail?.market_data?.price_change_24h) * 100) /
            currentPrice
          ).toFixed(2),
          balance: Number(balance).toFixed(4),
          balanceUSD: `${balanceUSD.toFixed(2)}`,
          portfolioPercent: `${portfolioPercent || 0}%`,
          valueUSD: `${balanceUSD.toFixed(2)}`,
          transactions: transactions,
        });
      } else if (
        user.company.company_account_type == COMPANY_ACCOUNT_TYPE.BANKING ||
        user.company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
      ) {
        let detail = account?.account_detail || '{}';
        if (
          account.asset.type == ASSET_TYPE.CRYPTOCURRENCY ||
          account.asset.type == ASSET_TYPE.TOKEN
        ) {
          detail = '{}';
        }

        const transactions = await this.transactionRepository.find({
          where: { account: { id: account?.id } },
          relations: ['account', 'account.asset'],
        });
        /*
        const transactions = await this.ibaneraProviderService.getTransaction(
          detail.account_id,
        );
        */

        const balance = account.balance;
        const balanceUSD = 0;
        const portfolioPercent = 0;

        return new UserAccountDto({
          id: `${account?.account_id}`,
          icon: `${account?.asset?.icon}`,
          assetType: `${account?.asset.type}`,
          asset: `${account?.asset?.name}`,
          ticker: `${account?.asset?.ticker}`,
          network: [JSON.stringify(detail)],
          network_icon: '',
          address: `${account?.account_number}`,
          marketCap: '0',
          price: '0',
          priceChange: '0',
          balance: Number(balance).toFixed(4),
          balanceUSD: `${balanceUSD.toFixed(2)}`,
          portfolioPercent: `${portfolioPercent || 0}%`,
          valueUSD: `${balanceUSD.toFixed(2)}`,
          transactions: transactions,
        });
      }
    }
  }
}
