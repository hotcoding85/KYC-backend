import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AccountService } from './account.service';
import { ThirteenxProviderService } from '../provider/thirteenx/thirteenx.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AccountWatcherService {
  constructor(
    private readonly accountService: AccountService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly thirteenxProviderService: ThirteenxProviderService,
  ) {}

  // @Cron(CronExpression.EVERY_10_MINUTES)
  async checkAccountBalance() {
    console.log('Intiializing POlling');
    const users = await this.userRepository.find({
      relations: ['company', 'accounts', 'accounts.asset', 'accounts.network'],
    });

    const userPromises = users.map(async (user) => {
      try {
        const wallets = await this.thirteenxProviderService.getWallets(
          user,
          {},
        );
        console.log(wallets);
        for (const wallet of wallets) {
          const balanceBody = wallet.balance || [];

          for (const balance of balanceBody) {
            const onchainBalance = parseFloat(balance.onchain_balance);
            const lockedBalance = parseFloat(balance.locked_balance);
            const pendingBalance = parseFloat(balance.pending_balance);
            const offchainBalance = parseFloat(balance.offchain_balance);
            console.log(balanceBody);
            const mainBalance =
              onchainBalance + offchainBalance - lockedBalance;

            const matchingAccount = user.accounts.find(
              (account) =>
                account.asset.name === balance.asset &&
                (!balance.blockchain ||
                  account.network?.name === balance.blockchain),
            );
            console.log(matchingAccount);
            if (matchingAccount) {
              await this.accountService.updateBalance(
                user,
                matchingAccount.asset,
                matchingAccount.network,
                mainBalance / matchingAccount?.asset?.denomination,
              );
            } else {
              console.warn(
                `No matching account found for user ${user.id}, asset ${balance.asset}`,
              );
            }
          }
        }
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
      }
    });

    await Promise.all(userPromises);
  }
}
