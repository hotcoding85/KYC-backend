import { Body, Controller, Post, UseGuards, Req, Get, Param, Delete, Patch } from '@nestjs/common';
import { BeneficiaryService } from './beneficiary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { Request as ERequest } from 'express';
import { AllowApiCall } from 'src/common/decorators/allow-api-call.decorator';
import { Beneficiary } from './entities/beneficiary.entity';
@Controller('beneficiary')
export class BeneficiaryController {
  constructor(private readonly beneficiaryService: BeneficiaryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() req: ERequest,
    @Body() createBeneficiaryDto: CreateBeneficiaryDto,
  ) {
    return this.beneficiaryService.create(req, createBeneficiaryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':beneficiary_id')
  getBeneficiary(
    @Req() req: ERequest,
    @Param('beneficiary_id') beneficiary_id: string,
  ) {
    return this.beneficiaryService.findBeneficiaryOne(beneficiary_id);
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Post('/all')
  async getAccountsForUser(@Req() req: ERequest): Promise<Beneficiary[]> {
    return this.beneficiaryService.getBeneficiaries(req);
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Delete(':beneficiary_id/delete')
  softDeleteCompany(@Param('beneficiary_id') beneficiary_id: string) {
    return this.beneficiaryService.softDeleteBeneficiary(beneficiary_id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update-beneficiary/:beneficiary_id')
  async updateUserWithProfile(
    @Req() req: ERequest,
    @Param('beneficiary_id') beneficiary_id: number,
    @Body() updateUserWithPRofileDto,
  ) {
    return this.beneficiaryService.updateBeneficiary(
      req,
      updateUserWithPRofileDto,
      beneficiary_id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/add-account/:beneficiary_id')
  async addBeneficiaryAccount(
    @Req() req: ERequest,
    @Param('beneficiary_id') beneficiary_id: string,
  ) {
    return this.beneficiaryService.addBeneficiaryAccount(
      req,
      beneficiary_id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/update-account/:beneficiary_id/:account_id')
  async updateBeneficiaryAccount(
    @Req() req: ERequest,
    @Param('beneficiary_id') beneficiary_id: string,
    @Param('account_id') account_id: number,
  ) {
    return this.beneficiaryService.updateBeneficiaryAccount(
      req,
      beneficiary_id,
      account_id
    );
  }
  
}
