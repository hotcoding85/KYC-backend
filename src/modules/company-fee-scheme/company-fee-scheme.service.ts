import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyFeeSchemeDto } from './dto/create-company-fee-scheme.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../company/entities/company.entity';
import { CompanyFeeScheme } from './entity/company-fee-scheme.entity';
import { UpdateCompanyFeeSchemeDto } from './dto/update-company-fee-scheme.dto';

@Injectable()
export class CompanyFeeSchemeService {
  constructor(
    @InjectRepository(CompanyFeeScheme)
    private companyFeeSchemeRepository: Repository<CompanyFeeScheme>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async createCompanyFeeScheme(
    createCompanyFeeSchemeDto: CreateCompanyFeeSchemeDto,
  ) {
    const { companyId, ...feeSchemeData } = createCompanyFeeSchemeDto;

    // Find the company
    const company = await this.companyRepository.findOne({
      where: { company_id: companyId },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Create the new company fee scheme
    const newCompanyFeeScheme = this.companyFeeSchemeRepository.create({
      ...feeSchemeData,
      company: company,
    });

    // Save and return the new company fee scheme
    return this.companyFeeSchemeRepository.save(newCompanyFeeScheme);
  }

  async updateCompanyFeeScheme(
    companyFeeSchemeId: string,
    updateCompanyFeeSchemeDto: UpdateCompanyFeeSchemeDto,
  ) {
    const companyFeeScheme = await this.companyFeeSchemeRepository.findOne({
      where: { fee_scheme_id: companyFeeSchemeId },
    });
    if (!companyFeeScheme) {
      throw new NotFoundException(
        `Company Fee Scheme with ID ${companyFeeSchemeId} not found`,
      );
    }

    // If companyId is provided, update the company association
    if (updateCompanyFeeSchemeDto.companyId) {
      const newCompany = await this.companyRepository.findOne({
        where: { company_id: updateCompanyFeeSchemeDto.companyId },
      });
      if (!newCompany) {
        throw new NotFoundException(
          `Company with ID ${updateCompanyFeeSchemeDto.companyId} not found`,
        );
      }
      companyFeeScheme.company = newCompany;
    }

    // Update other fields
    Object.assign(companyFeeScheme, updateCompanyFeeSchemeDto);

    // Save and return the updated company fee scheme
    return this.companyFeeSchemeRepository.save(companyFeeScheme);
  }

  async getCompanyFeeSchemeById(companyFeeSchemeId: string) {
    const companyFeeScheme = await this.companyFeeSchemeRepository.findOne({
      where: {
        fee_scheme_id: companyFeeSchemeId,
      },
    });

    if (!companyFeeScheme) {
      throw new NotFoundException(
        `company fee scheme with id ${companyFeeSchemeId} cannot be found`,
      );
    }
    return companyFeeScheme;
  }

  async getCompanyFeeSchemeByCompanyId(companyId: string) {
    const companyFeeSchemes = await this.companyFeeSchemeRepository.find({
      where: {
        company: {
          company_id: companyId,
        },
      },
    });

    return companyFeeSchemes;
  }

  async deleteCompanyFeeScheme(companyFeeSchemeId: string) {
    const companyFeeScheme = await this.companyFeeSchemeRepository.findOne({
      where: {
        fee_scheme_id: companyFeeSchemeId,
      },
    });
    if (!companyFeeScheme) {
      throw new NotFoundException(
        `company fee scheme with id ${companyFeeSchemeId} cannot be found`,
      );
    }

    return await this.companyFeeSchemeRepository.remove(companyFeeScheme);
  }
}
