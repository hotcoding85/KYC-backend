import { Module } from '@nestjs/common';
import { CompanyFeeSchemeService } from './company-fee-scheme.service';
import { CompanyFeeSchemeController } from './company-fee-scheme.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyFeeScheme } from './entity/company-fee-scheme.entity';
import { Company } from '../company/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyFeeScheme, Company])],
  providers: [CompanyFeeSchemeService],
  controllers: [CompanyFeeSchemeController],
})
export class CompanyFeeSchemeModule {}
