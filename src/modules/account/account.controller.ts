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
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAccountDto } from './dtos/create-account.dto';
import { Account } from './entities/account.entity';
import { UpdateAccountDto } from './dtos/update-account.dto';
import { UserAccountDto } from './dtos/user-account.dto';
import { Request as ERequest } from 'express';
import { AllowApiCall } from 'src/common/decorators/allow-api-call.decorator';
import { AllowPublicCall } from 'src/common/decorators/allow-public-call.decorator';
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}
  @Post()
  async create(
    @Body(ValidationPipe) createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    return this.accountService.create(createAccountDto);
  }

  @Post('/add')
  async addAccount(
    @Body('asset_id') assetId: string,
    @Req() req: ERequest,
  ): Promise<Account> {
    console.log(assetId);
    return this.accountService.addAccount(req, assetId);
  }

  @AllowPublicCall()
  @Get('/ibanera')
  async testIbanera() {
    return this.accountService.testIbanera();
  }
  @Get(':account_id')
  async findOne(@Param('account_id') accountId: string): Promise<Account> {
    return this.accountService.findOne(accountId);
  }

  @Get()
  async findAll(): Promise<Account[]> {
    return this.accountService.findAll();
  }

  @Get('/company/:company_id')
  async getAccountsForCompany(@Param('company_id') companyId: string) {
    return this.accountService.getAccountsForCompany(companyId);
  }

  @AllowApiCall()
  @Post('/all/:account_id')
  async getAccountForUser(
    @Param('account_id') accountId: string,
    @Req() req: ERequest,
  ): Promise<UserAccountDto> {
    return this.accountService.getAccount(req, accountId);
  }

  @Post('/all')
  async getAccounts(@Req() req: ERequest): Promise<UserAccountDto[]> {
    return this.accountService.getAccounts(req);
  }

  @Post('/user/:user_id')
  async getAccountsForUser(
    @Param('user_id') userId: string,
    @Req() req: ERequest,
  ): Promise<UserAccountDto[]> {
    return this.accountService.getAccountsForUser(req, userId);
  }

  @Put(':account_id')
  async update(
    @Param('account_id') accountId: string,
    @Body(ValidationPipe) updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    return this.accountService.update(accountId, updateAccountDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.accountService.remove(id);
  }
}
