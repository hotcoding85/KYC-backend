import { Module } from '@nestjs/common';
import { CompanyNodeController } from './company-node.controller';
import { CompanyNodeService } from './company-node.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyNode } from './entity/company-node.entity';
import { Company } from '../company/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyNode, Company])],
  controllers: [CompanyNodeController],
  providers: [CompanyNodeService],
})
export class CompanyNodeModule {}
