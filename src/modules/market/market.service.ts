import { Injectable } from '@nestjs/common';
import { UtilityService } from '../common/utility/utility.service';

@Injectable()
export class MarketService {
  constructor(private readonly utilityService: UtilityService) {}

  async getCurrentPrice(currency: string): Promise<number> {
    const url = `https://pro-api.coingecko.com/api/v3/simple/price?ids=${currency.toLowerCase()}&vs_currencies=usd`;
    const response = await this.utilityService.eventAPI(url, {}, 'GET', {
      'x-cg-pro-api-key': process.env.MARKET_PRICE_PROVIDER_KEY,
    });

    if (response && response[currency.toLowerCase()]) {
      return response[currency.toLowerCase()].usd;
    }

    throw new Error(`Failed to fetch the current price for ${currency}`);
  }

  async getCoinDetail(currency: string): Promise<any> {
    const url = `https://pro-api.coingecko.com/api/v3/coins/${currency.toLowerCase()}`;
    const response = await this.utilityService.eventAPI(url, {}, 'GET', {
      'x-cg-pro-api-key': process.env.MARKET_PRICE_PROVIDER_KEY,
    });

    if (response) {
      return response;
    }

    throw new Error(`Failed to fetch the current price for ${currency}`);
  }
}
