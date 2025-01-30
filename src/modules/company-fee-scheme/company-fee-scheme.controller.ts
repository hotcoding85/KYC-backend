import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CompanyFeeSchemeService } from './company-fee-scheme.service';
import { CreateCompanyFeeSchemeDto } from './dto/create-company-fee-scheme.dto';
import { UpdateCompanyFeeSchemeDto } from './dto/update-company-fee-scheme.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('company-fee-scheme')
export class CompanyFeeSchemeController {
  constructor(
    private readonly companyFeeSchemeService: CompanyFeeSchemeService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createCompanyFeeScheme(
    @Body() createCompanyFeeSchemeDto: CreateCompanyFeeSchemeDto,
  ) {
    return this.companyFeeSchemeService.createCompanyFeeScheme(
      createCompanyFeeSchemeDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':company_fee_scheme_id')
  updateCompanyFeeScheme(
    @Param('company_fee_scheme_id') companyFeeSchemeId: string,
    @Body() updateCompanyFeeSchemeDto: UpdateCompanyFeeSchemeDto,
  ) {
    return this.companyFeeSchemeService.updateCompanyFeeScheme(
      companyFeeSchemeId,
      updateCompanyFeeSchemeDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':company_fee_scheme_id')
  getCompanyFeeSchemeById(
    @Param('company_fee_scheme_id') companyFeeSchemeId: string,
  ) {
    return this.companyFeeSchemeService.getCompanyFeeSchemeById(
      companyFeeSchemeId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/company/:company_id')
  getCompanyFeeSchemeByCompanyId(@Param('company_id') companyId: string) {
    return this.companyFeeSchemeService.getCompanyFeeSchemeByCompanyId(
      companyId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':company_fee_scheme_id')
  deleteCompanyFeeScheme(
    @Param('company_fee_scheme_id') companyFeeSchemeId: string,
  ) {
    return this.companyFeeSchemeService.deleteCompanyFeeScheme(
      companyFeeSchemeId,
    );
  }
}
