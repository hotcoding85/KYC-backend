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
import { CreateCompanyNodeDto } from './dtos/create-company-node.dto';
import { CompanyNodeService } from './company-node.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateCompanyNodeDto } from './dtos/update-company-node.dto';

@Controller('company-node')
export class CompanyNodeController {
  constructor(private readonly companyNodeService: CompanyNodeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createCompanyNode(@Body() createCompanyNodeDto: CreateCompanyNodeDto) {
    return this.companyNodeService.createCompanyNode(createCompanyNodeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':company_node_id')
  async updateCompanyNode(
    @Param('company_node_id') company_node_id: string,
    @Body() updateCompanyNodeDto: UpdateCompanyNodeDto,
  ) {
    return this.companyNodeService.updateCompanyNode(
      company_node_id,
      updateCompanyNodeDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':company_node_id')
  async getCompanyNodeById(@Param('company_node_id') company_node_id: string) {
    const node =
      await this.companyNodeService.getCompanyNodeById(company_node_id);

    return node;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/company/:company_id')
  async getNodesByCompanyId(@Param('company_id') companyId: string) {
    return this.companyNodeService.getNodesByCompanyId(companyId);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':company_node_id')
  async deleteCompanyNode(@Param('company_node_id') companyNodeId: string) {
    return this.companyNodeService.deleteCompanyNode(companyNodeId);
  }
}
