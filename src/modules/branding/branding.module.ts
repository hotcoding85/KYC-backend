import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyBranding } from './entities/branding.entity';
import { CompanyBrandingService } from './branding.service';
import { CompanyBrandingController } from './branding.controller';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { CompanyModule } from '../company/company.module';
import { Company } from '../company/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyBranding, Company]),
    forwardRef(() => AuthModule),
    CommonModule,
    CompanyModule
  ],
  controllers: [CompanyBrandingController],
  providers: [CompanyBrandingService],
  exports: [CompanyBrandingService]
})
export class BrandingModule {}
