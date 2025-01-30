import { Injectable, NotFoundException, Req } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../company/entities/company.entity';
import { User } from '../user/entities/user.entity';
import { Asset } from '../asset/entities/asset.entity';
import { Network } from '../asset-networks/entity/networks.entity';
import { IbaneraProviderService } from '../provider/ibanera/ibanera.service';
import { ThirteenxProviderService } from '../provider/thirteenx/thirteenx.service';
import { UtilityService } from '../common/utility/utility.service';
import { MarketService } from '../market/market.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

import { ASSET_TYPE, COMPANY_ACCOUNT_TYPE, ROLE } from 'src/lib/enums';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Network)
    private readonly networkRespository: Repository<Network>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private jwtService: JwtService,
    private readonly marketService: MarketService,
    private readonly utilityService: UtilityService,
    private readonly ibaneraProviderService: IbaneraProviderService,
    private readonly thirteenxProviderService: ThirteenxProviderService,
  ) {}

  async testIbanera() {}

  async addCard(@Req() req: Request, asset_id: string): Promise<Card> {
    const me = await this.utilityService.me(req, this.jwtService);
    if (me) {
      const user = await this.userRepository.findOne({
        where: { id: me },
      });

      const asset = await this.assetRepository.findOne({
        where: { asset_id: asset_id },
      });

      try {
        const cards = await this.ibaneraProviderService.createCard(
          user.external_id,
          asset.ticker,
        );

        const cardDetail = {
          routing_number: cards?.card?.routingNumber,
          swift: cards?.card?.swiftCode,
          account_id: cards?.card?.id,
          virtual_account_number: cards?.card?.virtualAccountNumber,
        };

        const cardData = {
          asset,
          user,
          card_number: cards.cards.cardNumber,
          card_detail: JSON.stringify(cardDetail),
          network: null,
        };

        const card = await this.cardRepository.create(cardData);
        return await this.cardRepository.save(card);
      } catch (error) {
        console.error('Error creating card:', error);
        throw new Error('Failed to create card');
      }
    }
  }

  async getCards(user_id: string) {
    try {
      // Find the user by user_id
      const user = await this.userRepository.findOne({
        where: {
          user_id: user_id,
        },
      });
  
      if (!user) {
        throw new Error(`User with ID ${user_id} not found`);
      }
      // Find all cards associated with the user
      const cards = await this.cardRepository.find({
        where: {
          user: { user_id: user_id }, // Match by user_id instead of user object
        },
        relations: ['asset', 'network'], // Load related entities if needed
      });
  
      return cards;
    } catch (error) {
      // Handle and log the error as needed
      console.error('Error fetching cards:', error.message);
      throw new Error('Unable to fetch cards. Please try again later.');
    }
  }
}
