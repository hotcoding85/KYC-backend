import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CompanyBrandingService } from './branding.service';
import { CompanyBranding } from './entities/branding.entity';

@Controller('branding')
export class CompanyBrandingController {
  constructor(private readonly brandingService: CompanyBrandingService) {}

  @Get(':companyId')
  async getBranding(@Param('companyId') companyId: string){
    const brandings = await this.brandingService.getBranding(companyId)
    return { status: 'success', branding: brandings };
  }

  @Post(':companyId')
  async createOrUpdateBranding(
    @Param('companyId') companyId: string,
    @Body() brandingData: Partial<CompanyBranding>,
  ) {
    const branding = await this.brandingService.createOrUpdateBranding(companyId, brandingData)
    return {status: 'success', branding: branding};
  }


  @Delete(':companyId')
  async deleteBranding(@Param('companyId') companyId: string) {
    await this.brandingService.deleteBranding(companyId)
    return {status: 'success'};
  }
}
