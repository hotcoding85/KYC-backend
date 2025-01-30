import { Injectable, NotFoundException, Req } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Beneficiary } from './entities/beneficiary.entity';
import { BeneficiaryAccount } from './entities/beneficiary-account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBeneficiaryDto } from './dto/create-beneficiary.dto';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { UtilityService } from '../common/utility/utility.service';
import { Asset } from '../asset/entities/asset.entity';
import { UpdateBeneficiaryDto } from './dto/update-beneficiary.dto';
import { Network } from '../asset-networks/entity/networks.entity';
@Injectable()
export class BeneficiaryService {
  constructor(
    @InjectRepository(Beneficiary)
    private beneficiaryRepository: Repository<Beneficiary>,
    @InjectRepository(BeneficiaryAccount)
    private beneficiaryAccountRepository: Repository<BeneficiaryAccount>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly utilityService: UtilityService,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Network)
    private readonly networkRepository: Repository<Network>,
  ) {}

  async create(
    @Req() req: Request,
    createBeneficiaryDto: CreateBeneficiaryDto,
  ) {
    try {
      const me = await this.utilityService.me(req, this.jwtService);
      if (me) {
        const user = await this.userRepository.findOne({
          where: { id: me },
        });

        // Create and save the beneficiary
        const beneficiary =
          this.beneficiaryRepository.create(createBeneficiaryDto);
        beneficiary.user = user;
        const savedBeneficiary =
          await this.beneficiaryRepository.save(beneficiary);

        // Use the saved beneficiary's ID
        const beneficiaryAccountDto = {
          account_detail: {
            sortCode: req.body.sortCode,
            swift: req.body.swift,
            iban: req.body.iban,
          },
          account_number: req.body.accountNumber,
        };

        // Create and save the beneficiary account
        const beneficiaryAccount = this.beneficiaryAccountRepository.create(
          beneficiaryAccountDto,
        );
        const asset = req.body.currency;
        beneficiaryAccount.asset = asset;

        const network = await this.networkRepository
          .createQueryBuilder('network')
          .leftJoinAndSelect('network.asset', 'asset') // Ensure network is related to asset
          .where('network.asset = :assetId', {
            assetId: beneficiaryAccount.asset.id,
          })
          .getOne();
        beneficiaryAccount.network = network;
        beneficiaryAccount.beneficiary = savedBeneficiary;
        const accountRecord =
          await this.beneficiaryAccountRepository.save(beneficiaryAccount);

        return savedBeneficiary;
      }
    } catch (error) {
      console.log(error);
      throw new Error('Error creating beneficiary');
    }
  }

  async getBeneficiaries(@Req() req: Request): Promise<Beneficiary[]> {
    const me = await this.utilityService.me(req, this.jwtService);
    if (me) {
      const user = await this.userRepository.findOne({
        where: { id: me },
        relations: [
          'beneficiaries',
          'beneficiaries.beneficiary_accounts',
          'beneficiaries.beneficiary_accounts.asset',
        ],
      });
      if (!user) {
        throw new NotFoundException(`Account can not be accessed`);
      }

      // Sort beneficiaries by created_at (most recent first)
      const sortedBeneficiaries = user.beneficiaries
        .filter((bene) => !bene.deleted)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

      return sortedBeneficiaries;
    }
  }

  async findOne(id: string): Promise<BeneficiaryAccount> {
    const beneficiary = await this.beneficiaryRepository.findOne({
      where: {
        beneficiary_id: id,
      },
    });
    const beneficiaryAccount = await this.beneficiaryAccountRepository.findOne({
      where: {
        beneficiary: { beneficiary_id: id },
      },
      relations: ['beneficiary', 'asset'],
    });
    if (!beneficiaryAccount) {
      throw new NotFoundException(`beneficiaryAccount with ID ${id} not found`);
    }

    return beneficiaryAccount;
  }

  async findBeneficiaryOne(id: string): Promise<Beneficiary> {
    const beneficiary = await this.beneficiaryRepository.findOne({
      where: {
        beneficiary_id: id,
      },
      relations: [
        'beneficiary_accounts',
        'beneficiary_accounts.asset',
        'beneficiary_accounts.network',
      ],
    });
    if (!beneficiary) {
      throw new NotFoundException(`Beneficiary with ID ${id} not found`);
    }

    return beneficiary;
  }

  async softDeleteBeneficiary(beneficiary_id: string) {
    const beneficiary = await this.beneficiaryRepository.findOne({
      where: {
        beneficiary_id: beneficiary_id,
      },
    });

    if (!beneficiary) {
      throw new NotFoundException(
        `Company with id ${beneficiary} cannot be found`,
      );
    }

    beneficiary.deleted = true;
    return await this.beneficiaryRepository.save(beneficiary);
  }

  async update(
    id: string,
    updateBeneficiaryDto: UpdateBeneficiaryDto,
  ): Promise<Beneficiary> {
    const beneficiary = await this.findBeneficiaryOne(id);
    if (
      updateBeneficiaryDto.avatar &&
      beneficiary.avatar !== updateBeneficiaryDto.avatar
    ) {
      beneficiary.avatar &&
        (await this.utilityService.deleteImageByUrl(beneficiary.avatar));

      const image = updateBeneficiaryDto.avatar;
      const extensionMatch = image.match(/\/(.*?);base64,/);
      const extension = extensionMatch ? extensionMatch[1] : 'png';
      const fileName = `${beneficiary.full_name}_${Date.now()}.${extension}`;
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const path = await this.utilityService.uploadToS3(
        'watpay',
        `assets/${fileName}`,
        buffer,
      );

      updateBeneficiaryDto.avatar = path.Location;
    }
    Object.assign(beneficiary, updateBeneficiaryDto);
    return this.beneficiaryRepository.save(beneficiary);
  }

  async addBeneficiaryAccount(@Req() req: Request, beneficiary_id: string) {
    const beneficiaryAccountDto = {
      account_detail: req.body.account_detail,
      account_number: req.body.account_number,
    };

    const savedBeneficiary = await this.beneficiaryRepository.findOne({
      where: {
        beneficiary_id: beneficiary_id,
      },
    });
    // Create and save the beneficiary account
    const beneficiaryAccount = this.beneficiaryAccountRepository.create(
      beneficiaryAccountDto,
    );
    beneficiaryAccount.asset = req.body.asset;

    const network = await this.networkRepository
      .createQueryBuilder('network')
      .leftJoinAndSelect('network.asset', 'asset') // Ensure network is related to asset
      .where('network.asset = :assetId', { assetId: req.body.asset.id })
      .getOne();
    beneficiaryAccount.network = network;
    beneficiaryAccount.beneficiary = savedBeneficiary;
    const accountRecord =
      await this.beneficiaryAccountRepository.save(beneficiaryAccount);

    return accountRecord;
  }

  async updateBeneficiaryAccount(
    @Req() req: Request,
    beneficiary_id: string,
    account_id: number,
  ) {
    const me = await this.utilityService.me(req, this.jwtService);
    if (me) {
      const user = await this.userRepository.findOne({
        where: { id: me },
      });
      const UpdateBeneficiaryAccountDto = req.body;
      // Create and save the beneficiary
      const beneficiaryAccount =
        await this.beneficiaryAccountRepository.findOne({
          where: {
            id: account_id,
          },
        });

      Object.assign(beneficiaryAccount, UpdateBeneficiaryAccountDto);
      return this.beneficiaryAccountRepository.save(beneficiaryAccount);
    }
  }

  async updateBeneficiary(@Req() req: Request, beneficiary, beneficiary_id) {
    const me = await this.utilityService.me(req, this.jwtService);
    if (me) {
      const user = await this.userRepository.findOne({
        where: { id: me },
      });
      const createBeneficiaryDto = req.body;
      // Create and save the beneficiary
      const beneficiary = await this.update(
        beneficiary_id,
        createBeneficiaryDto,
      );
      // beneficiary.user = user;
      // const savedBeneficiary = await this.beneficiaryRepository.save(beneficiary);

      // Use the saved beneficiary's ID
      // const beneficiaryAccountDto = {
      //   account_detail: {
      //     sortCode: req.body.sortCode,
      //     swift: req.body.swift,
      //   },
      //   account_number: req.body.accountNumber,
      //   iban: req.body.iban,
      //   beneficiary_id: savedBeneficiary.id, // Access ID after saving
      //   asset_id: req.body.currency,
      // };

      // // Create and save the beneficiary account
      // const beneficiaryAccount = this.beneficiaryAccountRepository.create(beneficiaryAccountDto);
      // const asset = await this.assetRepository.findOne({
      //   where: { id: req.body.currency },
      // });
      // beneficiaryAccount.asset = asset
      // beneficiaryAccount.beneficiary = savedBeneficiary
      // const accountRecord = await this.beneficiaryAccountRepository.save(beneficiaryAccount);

      return beneficiary;
    }
  }
  catch(error) {
    console.log(error);
    throw new Error('Error updating beneficiary');
  }
}
