import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyNodeDto } from './dtos/create-company-node.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyNode } from './entity/company-node.entity';
import { Company } from '../company/entities/company.entity';
import { Repository } from 'typeorm';
import { UpdateCompanyNodeDto } from './dtos/update-company-node.dto';

@Injectable()
export class CompanyNodeService {
  constructor(
    @InjectRepository(CompanyNode)
    private companyNodeRepository: Repository<CompanyNode>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async createCompanyNode(createCompanyNodeDto: CreateCompanyNodeDto) {
    const { companyId, ...nodeData } = createCompanyNodeDto;

    const company = await this.companyRepository.findOne({
      where: { company_id: companyId },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    const newCompanyNode = this.companyNodeRepository.create({
      ...nodeData,
      company: company,
    });

    return this.companyNodeRepository.save(newCompanyNode);
  }

  async updateCompanyNode(
    company_node_id: string,
    updateCompanyNodeDto: UpdateCompanyNodeDto,
  ) {
    const companyNode = await this.companyNodeRepository.findOne({
      where: { company_node_id: company_node_id },
    });
    if (!companyNode) {
      throw new NotFoundException(
        `Company Node with ID ${company_node_id} not found`,
      );
    }

    if (updateCompanyNodeDto.companyId) {
      const newCompany = await this.companyRepository.findOne({
        where: { company_id: updateCompanyNodeDto.companyId },
      });
      if (!newCompany) {
        throw new NotFoundException(
          `Company with ID ${updateCompanyNodeDto.companyId} not found`,
        );
      }
      companyNode.company = newCompany;
    }

    Object.assign(companyNode, updateCompanyNodeDto);

    return this.companyNodeRepository.save(companyNode);
  }

  async getCompanyNodeById(company_node_id: string) {
    const companyNode = await this.companyNodeRepository.findOne({
      where: { company_node_id },
      relations: {
        company: true,
      },
    });

    if (!companyNode) {
      throw new NotFoundException(
        `Company Node with ID ${company_node_id} not found`,
      );
    }

    return companyNode || null;
  }

  async getNodesByCompanyId(companyId: string) {
    const company = await this.companyRepository.findOne({
      where: { company_id: companyId },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    return this.companyNodeRepository.find({
      where: { company: { id: company.id } },
      relations: {
        company: true,
      },
    });
  }

  async deleteCompanyNode(companyNodeId: string) {
    const companyNode = await this.companyNodeRepository.findOne({
      where: {
        company_node_id: companyNodeId,
      },
    });
    if (!companyNode) {
      throw new NotFoundException(
        `company node with id ${companyNodeId} cannot be found`,
      );
    }

    return this.companyNodeRepository.remove(companyNode);
  }
}
