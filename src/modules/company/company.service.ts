import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository, DataSource, In } from 'typeorm';
import { Company } from './entities/company.entity';
import { User } from '../user/entities/user.entity';
import { Asset } from '../asset/entities/asset.entity';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCompanyDto } from './dto/company/create-company.dto';
import { UpdateCompanyDto } from './dto/company/update-company.dto';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { IbaneraProviderService } from '../provider/ibanera/ibanera.service';
import { ThirteenxProviderService } from '../provider/thirteenx/thirteenx.service';
import { CreateCompanyAdditionalInfoDto } from './dto/company-additional-info/create-company-additional-info.dto';
import { CompanyAdditionalInfo } from './entities/company-additional-info.entity';
import { AssetService } from '../asset/asset.service';
import { AccountService } from '../account/account.service';
import { CreateAccountDto } from '../account/dtos/create-account.dto';
import { ASSET_TYPE, COMPANY_ACCOUNT_TYPE, ROLE } from 'src/lib/enums';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Asset)
    private readonly assetRespository: Repository<Asset>,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly ibaneraProviderService: IbaneraProviderService,
    private readonly thirteenxProviderService: ThirteenxProviderService,
    @InjectRepository(CompanyAdditionalInfo)
    private readonly additionalInfoRepository: Repository<CompanyAdditionalInfo>,
    private readonly assetService: AssetService,
    private readonly accountsService: AccountService,
    private readonly dataSource: DataSource,
  ) {}

  async check(company_id: string): Promise<Company | undefined> {
    return this.companyRepository.findOne({
      where: { company_id: company_id },
      relations: ['branding'],
    });
  }

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    try {
      const company = this.companyRepository.create({
        ...createCompanyDto,
        status: false,
        active: false,
      });

      const savedCompany = await this.companyRepository.save(company);

      return savedCompany;
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique violation error code
        const match = error.detail.match(/Key \((.*?)\)=/);
        const field = match ? match[1] : 'unknown field';
        throw new ConflictException(
          `A company with this ${field} already exists.`,
        );
      } else if (error.code === '23502') {
        // PostgreSQL not-null violation error code
        const match = error.detail.match(/column "(.*?)"/);
        const field = match ? match[1] : 'unknown field';
        throw new BadRequestException(`${field} is required.`);
      } else if (error.code === '23503') {
        // PostgreSQL foreign key violation error code
        throw new BadRequestException('Invalid reference to a related entity.');
      } else {
        throw new BadRequestException(
          'An error occurred while creating the company. Please check your input and try again.',
        );
      }
    }
  }

  async admit(req: Request, company_id: string): Promise<Company> {
    try {
      const user = await this.authService.me(req);

      const company = await this.companyRepository.findOne({
        where: { company_id },
      });
      if (!company) {
        throw new NotFoundException(`Company with ID ${company_id} not found`);
      }

      const companyUser = await this.userRepository.findOne({
        where: {
          company: { company_id: company_id },
          role: ROLE.COMPANY_ADMINISTRATOR,
        },
        relations: ['company'],
      });
      if (!companyUser) {
        throw new NotFoundException(
          `Company does not have a primary user account`,
        );
      }

      if (
        company.company_account_type == COMPANY_ACCOUNT_TYPE.WEB3 ||
        company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
      ) {
        const thirteenxCompanyAccount =
          await this.thirteenxProviderService.createCompany(user, company);
        const thirteenxUserAccount =
          await this.thirteenxProviderService.createUser(user, companyUser);
        if (!thirteenxCompanyAccount || !thirteenxUserAccount) {
          throw new InternalServerErrorException(
            `Could not create company account with the provider`,
          );
        }
      } else if (
        company.company_account_type == COMPANY_ACCOUNT_TYPE.BANKING ||
        company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
      ) {
        // const ibaneraCompanyAccount =
        //   await this.ibaneraProviderService.createCompany(user, company);
        // const ibaneraUserAccount =
        //   await this.ibaneraProviderService.createUser(user, companyUser);
        // if (!ibaneraCompanyAccount || !ibaneraUserAccount) {
        //   throw new InternalServerErrorException(
        //     `Could not create company account with the provider`,
        //   );
        // }
      }

      const assets = await this.assetRespository.find({
        relations: ['networks'],
      });

      const cryptoPromises = await assets.map(async (asset) => {
        if (
          company.company_account_type == COMPANY_ACCOUNT_TYPE.WEB3 ||
          company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
        ) {
          if (asset.type == ASSET_TYPE.CRYPTOCURRENCY) {
            const thirteenxMainWallet =
              await this.thirteenxProviderService.createWallet(
                companyUser,
                companyUser,
                { name: asset.name },
                false,
              );

            if (!thirteenxMainWallet) {
              throw new InternalServerErrorException(
                `Could not create company crypto account with the provider`,
              );
            }

            const dto = new CreateAccountDto();
            dto.company_id = company.company_id;
            dto.asset_id = asset.asset_id;
            dto.account_number = thirteenxMainWallet.address;
            dto.account_detail = thirteenxMainWallet;

            await this.accountsService.create(dto);
          }
        } else if (
          company.company_account_type == COMPANY_ACCOUNT_TYPE.BANKING ||
          company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
        ) {
          // CREATE IBANERA COMPANY ACCOUNT
        }
      });

      const resultsCrypto = await Promise.allSettled(cryptoPromises);

      // Step 2: Process TOKEN assets after blockchain wallets are created
      const tokenPromises = await assets.map(async (asset) => {
        if (
          company.company_account_type == COMPANY_ACCOUNT_TYPE.WEB3 ||
          company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
        ) {
          if (asset.type == ASSET_TYPE.TOKEN) {
            const networks = asset.networks;
            const wallets = await this.thirteenxProviderService.getWallets(
              companyUser,
              companyUser,
            );

            for (const network of networks) {
              const wallet = wallets.find(
                (wallet) => wallet.network === network.name,
              );

              if (wallet) {
                const thirteenxMainWallet =
                  await this.thirteenxProviderService.AddToken(
                    companyUser,
                    companyUser,
                    { address: wallet.address },
                    {
                      name: asset.name,
                      testnet: false,
                      blockchain: { name: network.name, testnet: false },
                    },
                  );

                if (!thirteenxMainWallet) {
                  throw new InternalServerErrorException(
                    `Could not create company token account with the provider`,
                  );
                }

                const dto = new CreateAccountDto();
                dto.company_id = company.company_id;
                dto.asset_id = asset.asset_id;
                dto.account_number = thirteenxMainWallet.address;
                dto.account_detail = thirteenxMainWallet;
                dto.network_id = network.network_id;

                await this.accountsService.create(dto);
              } else {
                console.log(`No wallet found for network ${network.name}`);
              }
            }
          }
        } else if (
          company.company_account_type == COMPANY_ACCOUNT_TYPE.BANKING ||
          company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
        ) {
          // CREATE IBANERA COMPANY ACCOUNT
        }
      });

      const resultsToken = await Promise.allSettled(tokenPromises);

      const failedCryptoOperations = resultsCrypto.filter(
        (result) => result.status === 'rejected',
      );

      const failedTokenOperations = resultsToken.filter(
        (result) => result.status === 'rejected',
      );

      if (
        failedCryptoOperations.length > 0 ||
        failedTokenOperations.length > 0
      ) {
        console.error(
          'Some account creations failed:',
          failedCryptoOperations,
          failedTokenOperations,
        );
      }

      return this.companyRepository.save(company);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        `An error occurred while create company account with the provider. ${error}`,
      );
    }
  }

  async update(
    req: Request,
    company_id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const company = await this.companyRepository.findOne({
        where: { company_id },
      });

      if (!company) {
        throw new NotFoundException(`Company with ID ${company_id} not found`);
      }

      Object.assign(company, updateCompanyDto);
      if (updateCompanyDto?.status && updateCompanyDto?.active) {
        await this.admit(req, company_id);
      }
      return this.companyRepository.save(company);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        `An error occurred while updating the company. ${error}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Company[]> {
    return await this.companyRepository.find();
  }

  async findChildrenCompanies(req: Request): Promise<Company[]> {
    const user = await this.authService.me(req);
    const parentCompanyId = user.company?.id;

    if (!parentCompanyId) {
      return await this.companyRepository.find();
    }

    return this.findAllChildrenCompanies(parentCompanyId);
  }

  async fetchAllCompanies() {
    const companies = await this.companyRepository.find();
    return companies;
  }

  async findAllChildrenCompanies(id: number): Promise<Company[]> {
    const childCompanies = await this.companyRepository.find({
      where: { parent: { id: id } },
      relations: ['children'],
    });

    let allDescendants: Company[] = [];

    for (const child of childCompanies) {
      allDescendants.push(child);

      const nestedChildren = await this.findAllChildrenCompanies(child.id);
      allDescendants = [...allDescendants, ...nestedChildren];
    }

    return allDescendants;
  }

  async softDeleteComany(companyId: string) {
    const company = await this.companyRepository.findOne({
      where: {
        company_id: companyId,
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${company} cannot be found`);
    }

    company.deleted = true;
    return await this.companyRepository.save(company);
  }
  async addRequestedAdditionalInfo(
    companyId: string,
    createCompanyAdditionalInfoDto: CreateCompanyAdditionalInfoDto,
  ) {
    const company = await this.companyRepository.findOne({
      where: {
        company_id: companyId,
      },
      relations: {
        additionalInfo: true,
      },
    });

    if (!company) {
      throw new NotFoundException(
        `Company with id ${companyId} cannot be found`,
      );
    }

    let additionalInfo: CompanyAdditionalInfo;

    if (company.additionalInfo) {
      // Update existing additional info
      additionalInfo = company.additionalInfo;
      this.additionalInfoRepository.merge(
        additionalInfo,
        createCompanyAdditionalInfoDto,
      );
    } else {
      // Create new additional info
      additionalInfo = this.additionalInfoRepository.create(
        createCompanyAdditionalInfoDto,
      );
    }

    // Save the additional info
    await this.additionalInfoRepository.save(additionalInfo);

    // Associate the additional info with the company
    company.additionalInfo = additionalInfo;

    // Save and return the updated company
    return await this.companyRepository.save(company);
  }

  async getCompanyById(companyId: string) {
    const company = await this.companyRepository.findOne({
      where: {
        company_id: companyId,
      },
      relations: {
        additionalInfo: true,
      },
    });

    if (!company) {
      throw new NotFoundException(
        `Company with id ${companyId} cannot be found`,
      );
    }
    return company;
  }

  async getAdditionalInfoByCompanyId(companyId: string) {
    const company = await this.companyRepository.findOne({
      where: {
        company_id: companyId,
      },
      relations: {
        additionalInfo: true,
      },
    });

    if (!company) {
      throw new NotFoundException(`no company with id ${companyId} exists`);
    }

    return company.additionalInfo;
  }
}
