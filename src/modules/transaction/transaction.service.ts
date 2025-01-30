import {
  Injectable,
  Req,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, OptimisticLockVersionMismatchError } from 'typeorm';
import { Repository } from 'typeorm';
import { ThirteenxProviderService } from '../provider/thirteenx/thirteenx.service';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { Asset } from '../asset/entities/asset.entity';
import { User } from '../user/entities/user.entity';
import { Transaction as TransactionEntity } from './entities/transaction.entity';
import { Request } from 'express';
import { IncomingTransactionDto } from './dto/incoming-transaction.dto';
import { UserTransactionDto } from './dto/user-transaction.dto';
import { UtilityService } from '../common/utility/utility.service';
import { JwtService } from '@nestjs/jwt';
import { Account } from '../account/entities/account.entity';
import { OutgoingTransactionDto } from './dto/outgoing-transaction.dto';
import { IbaneraProviderService } from '../provider/ibanera/ibanera.service';
@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,

    private readonly thirteenxProviderService: ThirteenxProviderService,
    private readonly ibaneraProviderService: IbaneraProviderService,
    private jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly utilityService: UtilityService,
    private readonly entityManager: EntityManager,
  ) {}

  async getTransactionsForUser(
    @Req() req: Request,
  ): Promise<UserTransactionDto[]> {
    const me = await this.utilityService.me(req, this.jwtService);
    if (me) {
      const user = await this.userRepository.findOne({
        where: { id: me },
        relations: ['company'],
      });
      if (!user) {
        throw new NotFoundException(`Account can not be accessed`);
      }

      const assets = await this.assetRepository.find({
        select: [
          'name',
          'ticker',
          'country',
          'icon',
          'usd_value',
          'daily_volume',
          'denomination',
          'type',
        ],
      });

      const transactions =
        await this.thirteenxProviderService.getTransactionsForUser(user, {});

      const userTransactions = transactions.map((transaction) => {
        return new UserTransactionDto({
          id: `${transaction?.transaction_id}`,
          amount: transaction.amount,
          asset: assets.find((asset) => asset.name === transaction.asset),
          network: assets.find(
            (asset) => asset.name === transaction.blockchain,
          ),
          usd_rate: transaction.usd_rate || '0.00000000',
          fee_usd_rate: transaction.fee_usd_rate,
          type: transaction.type,
          transactionType: transaction.transactionType,
          blockchain: transaction.blockchain,
          from_address: transaction.from_address,
          to_address: transaction.to_address,
          blockchain_tx_hash: transaction.blockchain_tx_hash,
          blockchain_explorer: `${transaction.blockchain_explorer}`,
          confirmations: transaction.confirmations || 0,
          chain_fee: transaction.chain_fee || '0.00000000',
          platform_fee: transaction.platform_fee || '0.00000000',
          company_fee: transaction.company_fee || '0.00000000',
          status: transaction.status,
          created_at: transaction.created_at,
          confirmed_at: transaction.confirmed_at,
        });
      });

      return userTransactions;
    }
    return [];
  }

  async feeScheme(
    amount?: number,
    chain_fee?: number,
    asset?: Asset,
  ): Promise<number> {
    return 0.1 * chain_fee;
  }

  async companyFeeScheme(
    amount?: number,
    chain_fee?: number,
    asset?: Asset,
  ): Promise<number> {
    return 0.1 * chain_fee;
  }

  async estimateGas(
    req: Request,
    user_id: string,
    company_id: string,
    asset?: Asset,
    to?: string,
    from?: string,
    amount?: number,
  ): Promise<any> {
    const user = await this.authService.me(req);
    const companyUser =
      company_id && user_id
        ? this.userService.findByUserId(user_id, company_id)
        : false;
    try {
      /**** Reminder
       * Every quote needs to be timed by the backend when giving customers the gas price
       * upon executing the actual transaction the quote needs to be checked if its upto date or not
       * ***/
      const chain_fee = await this.thirteenxProviderService.estimateGas(
        user,
        companyUser,
        asset,
        to,
        from,
        amount,
      );

      const platform_fee = await this.feeScheme(amount, chain_fee, asset);
      const company_fee = await this.companyFeeScheme(amount, chain_fee, asset);

      return {
        chain_fee: chain_fee || 0,
        platform_fee: platform_fee,
        company_fee: company_fee,
      };
    } catch (error) {
      console.log(error);
      throw new Error(error.message || 'Failed to fetch wallets');
    }
  }

  async estimateExecutionGas(
    req: Request,
    user_id: string,
    company_id: string,
    asset?: Asset,
    to?: string,
    from?: string,
    amount?: number,
  ): Promise<any> {
    const user = await this.authService.me(req);
    const companyUser =
      company_id && user_id
        ? this.userService.findByUserId(user_id, company_id)
        : false;
    try {
      /**** Reminder
       * Every quote needs to be timed by the backend when giving customers the gas price
       * upon executing the actual transaction the quote needs to be checked if its upto date or not
       ****/
      const chain_fee =
        await this.thirteenxProviderService.estimateExecutionGas(
          user,
          companyUser,
          asset,
          to,
          from,
          amount,
        );

      const platform_fee = await this.feeScheme(amount, chain_fee, asset);
      const company_fee = await this.companyFeeScheme(amount, chain_fee, asset);

      return {
        chain_fee: chain_fee || 0,
        platform_fee: platform_fee,
        company_fee: company_fee,
      };
    } catch (error) {
      console.log(error);
      throw new Error(error.message || 'Failed to fetch wallets');
    }
  }

  async sendExternalNative(
    req: Request,
    user_id: string,
    company_id: string,
    asset?: Asset,
    to?: string,
    from?: string,
    amount?: number,
    chain_fee?: number,
  ): Promise<any> {
    const user = await this.authService.me(req);
    const companyUser =
      company_id && user_id
        ? this.userService.findByUserId(user_id, company_id)
        : false;
    try {
      const platform_fee = await this.feeScheme(amount, chain_fee, asset);
      const company_fee = await this.companyFeeScheme(amount, chain_fee, asset);
      return await this.thirteenxProviderService.sendNativeCurrency(
        user,
        companyUser,
        asset,
        to,
        from,
        amount,
        chain_fee,
        platform_fee,
        company_fee,
      );
    } catch (error) {
      console.log(error);
      throw new Error(error.message || 'Failed to fetch wallets');
    }
  }

  async sendExternalToken(
    req: Request,
    user_id: string,
    company_id: string,
    asset?: Asset,
    to?: string,
    from?: string,
    amount?: number,
    chain_fee?: number,
  ): Promise<any> {
    const user = await this.authService.me(req);
    const companyUser =
      company_id && user_id
        ? this.userService.findByUserId(user_id, company_id)
        : false;
    try {
      const platform_fee = await this.feeScheme(amount, chain_fee, asset);
      const company_fee = await this.companyFeeScheme(amount, chain_fee, asset);
      return await this.thirteenxProviderService.sendTokenCurrency(
        user,
        companyUser,
        asset,
        to,
        from,
        amount,
        chain_fee,
        platform_fee,
        company_fee,
      );
    } catch (error) {
      console.log(error);
      throw new Error(error.message || 'Failed to fetch wallets');
    }
  }

  async stats(req: Request, user_id: string, company_id: string): Promise<any> {
    const user = await this.authService.me(req);
    const companyUser =
      company_id && user_id
        ? this.userService.findByUserId(user_id, company_id)
        : false;
    try {
      return await this.thirteenxProviderService.stats(user, companyUser);
    } catch (error) {
      console.log(error);
      throw new Error(error.message || 'Failed to fetch wallets');
    }
  }

  async incomingTransactions(transaction: IncomingTransactionDto) {
    try {
      await this.entityManager.transaction(async (manager) => {
        const existingTransaction = await manager.findOne(TransactionEntity, {
          where: { transaction_number: transaction?.Id },
        });

        if (existingTransaction) {
          console.log(
            `Transaction with hash ${transaction?.Id} already exists, skipping...`,
          );
          return;
        }

        const account = await manager
          .createQueryBuilder(Account, 'account')
          .where(`account.account_detail ->> 'account_id' = :accountsId`, {
            accountsId: transaction.Data.AccountsId,
          })
          .leftJoinAndSelect('account.user', 'user')
          .leftJoinAndSelect('account.asset', 'asset')
          .getOne();
        console.log(account);

        if (!account) {
          console.log(
            `Account with account number ${transaction.Data.AccountsId} not found, skipping...`,
          );
          return;
        }

        const user = account.user;

        const chain_fee = 0;
        const platform_fee = 0;
        const company_fee = 0;
        const netTransactionAmount =
          Number(transaction?.Data?.Amount) -
          (chain_fee + company_fee + platform_fee);
        const transactionEntity = new TransactionEntity();
        transactionEntity.transaction_number = transaction?.Id;
        transactionEntity.amount = netTransactionAmount;
        //transactionEntity.usd_rate = await this.marketService.getCurrentPrice(account?.asset?.name);
        //transactionEntity.fee_usd_rate = await this.marketService.getCurrentPrice(account?.asset?.name);
        transactionEntity.usd_rate = 1;
        transactionEntity.fee_usd_rate = 1;
        transactionEntity.type = 'credit';
        transactionEntity.transactionType = 'external';
        //transactionEntity.origin = tx.from;
        transactionEntity.transaction_detail = JSON.stringify(
          transaction?.Data,
        );
        // Pull company policy and add the incoming transaction fees here
        transactionEntity.chain_fee = chain_fee;
        transactionEntity.platform_fee = platform_fee;
        transactionEntity.company_fee = company_fee;
        transactionEntity.status = transaction.Data.bFlagged
          ? 'pending'
          : 'confirmed';
        transactionEntity.is_delegate = false;
        transactionEntity.is_sweep = false;
        transactionEntity.is_gas = false;
        transactionEntity.account = account || null;
        transactionEntity.confirmed_at = new Date();

        await manager.save(transactionEntity);

        if (account) {
          const totalAmount = Number(transaction?.Data?.Amount);
          const feeAmount =
            Number(transactionEntity.chain_fee) +
            Number(transactionEntity.company_fee) +
            Number(transactionEntity.platform_fee);
          const netAmount = totalAmount - feeAmount;

          try {
            if (transactionEntity.status == 'confirmed') {
              account.balance = Number(account.balance) + netAmount;
              await manager.save(account);
            }
          } catch (error) {
            if (error instanceof OptimisticLockVersionMismatchError) {
              throw new ConflictException(
                'Balance was updated by another transaction',
              );
            }
            throw error;
          }
        } else {
          console.log(
            `Balance for account ID ${transactionEntity.account.id} and asset ${transactionEntity.account?.asset} not found.`,
          );
        }
      });
    } catch (error) {
      console.error('Error saving transactions', error);
      throw error;
    }
    return {};
  }

  async outgoingTranscation(transaction: OutgoingTransactionDto) {
    try {
      const senderAccount = await this.accountRepository.findOne({
        where: { account_id: transaction?.account?.id },
      });

      const account_detail = senderAccount?.account_detail;
      const transfer = await this.ibaneraProviderService.external(
        account_detail.account_id,
        transaction.amount,
        {
          account_number: transaction?.beneficiaryAccount?.account_number,
          swift: transaction?.beneficiaryAccount?.account_detail.swift,
        },
        transaction.note,
      );
      console.log(transfer);
    } catch (error) {
      console.error('Error saving transactions', error);
      throw error;
    }
  }
}
