import {
  Body,
  Controller,
  Delete,
  Get,
  Req,
  Param,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CardService } from './card.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Card } from './entities/card.entity';
import { Request as ERequest } from 'express';
import { AllowApiCall } from 'src/common/decorators/allow-api-call.decorator';
import { AllowPublicCall } from 'src/common/decorators/allow-public-call.decorator';

@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('/all')
  async getAllCards(
    @Req() req: ERequest,
  ) {
    const user_id = req.body.user_id
    return this.cardService.getCards(user_id)
  }
  @Post('/add')
  async addCard(
    @Body('asset_id') assetId: string,
    @Req() req: ERequest,
  ): Promise<Card> {
    return this.cardService.addCard(req, assetId);
  }
}
