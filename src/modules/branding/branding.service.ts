import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyBranding } from './entities/branding.entity';
import { UtilityService } from '../common/utility/utility.service';
import { Company } from '../company/entities/company.entity';

@Injectable()
export class CompanyBrandingService {
  constructor(
    @InjectRepository(CompanyBranding)
    private readonly brandingRepository: Repository<CompanyBranding>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    private readonly utilityService: UtilityService,
  ) {}

  async getBranding(companyId: string): Promise<CompanyBranding> {
    return this.brandingRepository.findOne({
      where: {
        company: {
          company_id: companyId,
        },
      },
    });
  }

  async createOrUpdateBranding(
    companyId: string,
    brandingData: Partial<CompanyBranding>,
  ): Promise<CompanyBranding> {
    // Fetch existing branding record
    const company = await this.companyRepository.findOne({
      where: {
        company_id: companyId,
      },
    });


    let branding = await this.brandingRepository.findOne({
      where: {
        company: {
          company_id: companyId,
        },
      },
    });

    // Upload helper function
    const uploadFile = async (
      file: string,
      type: 'image' | 'file',
      source: string,
    ) => {
      const extensionMatch = file.match(/\/(.*?);base64,/);
      const extension = extensionMatch
        ? extensionMatch[1]
        : type === 'image'
          ? 'png'
          : 'txt';
      const fileName = `${companyId}_${source}_${Date.now()}.${extension}`;
      const base64Data = file.replace(/^data:(image|text)\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const path = await this.utilityService.uploadToS3(
        'watpay',
        `assets/${fileName}`,
        buffer,
      );

      return path.Location;
    };

    // Handle uploads if new data is provided
    if (brandingData.logo) {
      if (brandingData.logo.startsWith('data:image')) {
        if (branding?.logo) {
          await this.utilityService.deleteImageByUrl(branding.logo);
        }
        brandingData.logo = await uploadFile(
          brandingData.logo,
          'image',
          'logo',
        );
      }
    }

    if (brandingData.icon) {
      if (brandingData.icon.startsWith('data:image')) {
        if (branding?.icon) {
          await this.utilityService.deleteImageByUrl(branding.icon);
        }
        brandingData.icon = await uploadFile(
          brandingData.icon,
          'image',
          'icon',
        );
      }
    }

    if (brandingData.customCss) {
      if (brandingData.customCss.startsWith('data:text')) {
        if (branding?.customCss) {
          await this.utilityService.deleteImageByUrl(branding.customCss);
        }
        brandingData.customCss = await uploadFile(
          brandingData.customCss,
          'file',
          'custom',
        );
      }
    }

    if (brandingData.appStyle) {
      if (brandingData.appStyle.startsWith('data:text')) {
        if (branding?.appStyle) {
          await this.utilityService.deleteImageByUrl(branding.appStyle);
        }
        brandingData.appStyle = await uploadFile(
          brandingData.appStyle,
          'file',
          'app',
        );
      }
    }

    if (!branding) {
      // Create a new branding record
      branding = this.brandingRepository.create({
        company,
        ...brandingData,
      });
    } else {
      // Update existing branding record
      Object.assign(branding, brandingData);
    }

    // Save and return the branding record
    const companyBranding = await this.brandingRepository.save(branding);

    company.branding = companyBranding;
    await this.companyRepository.save(company);

    return companyBranding
  }

  async deleteBranding(companyId: string): Promise<void> {

    const company = await this.companyRepository.findOne({
      where: {
        company_id: companyId,
      },
    });

    await this.brandingRepository.delete({ company });
  }
}
