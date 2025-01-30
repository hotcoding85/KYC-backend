import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from './entities/company.entity';
import { isUUID } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AllowPublicCall } from 'src/common/decorators/allow-public-call.decorator';
import { CreateCompanyDto } from './dto/company/create-company.dto';
import { UpdateCompanyDto } from './dto/company/update-company.dto';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { AllowApiCall } from 'src/common/decorators/allow-api-call.decorator';
import { CreateCompanyAdditionalInfoDto } from './dto/company-additional-info/create-company-additional-info.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { UserService } from '../user/user.service';
@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly authService: AuthService,
    private readonly firebaseService: FirebaseService,
    private readonly userService: UserService
  ) {}

  @AllowPublicCall()
  @Get('check/:company_id')
  async checkCompany(@Param('company_id') companyId: string): Promise<Company> {
    if (!isUUID(companyId)) {
      throw new BadRequestException('Invalid company ID format');
    }
    const company = await this.companyService.check(companyId);
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found.`);
    }
    return company;
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Get('all')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async listCompanies(@Req() rtq: Request): Promise<Company[]> {
    return this.companyService.fetchAllCompanies();
  }

  @AllowPublicCall()
  @AllowApiCall()
  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
    createCompanyDto.status = false;
    createCompanyDto.active = false;
    return this.companyService.create(createCompanyDto);
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Patch(':company_id/update')
  async update(
    @Req() req: Request,
    @Param('company_id') company_id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    try {
      const updatedCompany = await this.companyService.update(
        req,
        company_id,
        updateCompanyDto,
      );

      const users = await this.userService.findByCompanyId(company_id);
      // Extract the `fcm_token` values from the users
      const fcmTokens: string[] = users.map((user) => user.fcm_token).filter(Boolean);
      const userIds: string[] = users
      .filter((user) => user.fcm_token) // Filter users with valid fcm_token
      .map((user) => user.user_id); // Extract user_id

      let status: string = '';
      if (updateCompanyDto.deleted) {
        status = 'deleted';
      } else if (updateCompanyDto.active === true) {
        status = 'activated';
      } else if (updateCompanyDto.active === false) {
        status = 'deactivated';
      } else if (updateCompanyDto.status === true) {
        status = 'approved';
      } else {
        status = 'updated'; // Default status
      }
      this.firebaseService.sendNotificationToMultipleTokens(fcmTokens, `Company ${updatedCompany.name} has been updated`, `Company ${updatedCompany.name} has been ${status}`, userIds)
      return updatedCompany;
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An error occurred during the update process',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Delete(':company_id/delete')
  softDeleteCompany(@Param('company_id') companyId: string) {
    return this.companyService.softDeleteComany(companyId);
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Patch(':company_id/additional-info')
  addRequestedAdditionalInfo(
    @Param('company_id') companyId: string,
    @Body() createCompanyAdditionalInfoDto: CreateCompanyAdditionalInfoDto,
  ) {
    return this.companyService.addRequestedAdditionalInfo(
      companyId,
      createCompanyAdditionalInfoDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':company_id/additional-info')
  getAdditionalInfoByCompanyId(@Param('company_id') companyId: string) {
    return this.companyService.getAdditionalInfoByCompanyId(companyId);
  }

  @UseGuards(JwtAuthGuard)
  @AllowApiCall()
  @Get(':company_id')
  getCompanyById(@Param('company_id') companyId: string) {
    return this.companyService.getCompanyById(companyId);
  }
}
