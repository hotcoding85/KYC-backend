import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Account } from '../account/entities/account.entity';
import { User } from './entities/user.entity';
import { Company } from '../company/entities/company.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserWithProfileDto } from './dto/create-user-with-profile.dto';
import { IbaneraProviderService } from '../provider/ibanera/ibanera.service';
import { ThirteenxProviderService } from '../provider/thirteenx/thirteenx.service';
import { UserProfile } from './entities/user-profile.entity';
import { AuthService } from '../auth/auth.service';
import { AccountService } from '../account/account.service';
import { Asset } from '../asset/entities/asset.entity';
import { UtilityService } from '../common/utility/utility.service';
import { UpdateUserWithProfileDto } from './dto/update-user-with-profile.dto';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { CreateAccountDto } from '../account/dtos/create-account.dto';
import { ASSET_TYPE, COMPANY_ACCOUNT_TYPE, ROLE } from 'src/lib/enums';
import * as bcrypt from 'bcrypt';
import { ApproveUserDto } from './dto/approve-user.dto';
// This should be a real class/interface representing a user entity

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,

    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,

    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    private readonly ibaneraProviderService: IbaneraProviderService,
    private readonly thirteenxProviderService: ThirteenxProviderService,
    private readonly authService: AuthService,
    private readonly accountsService: AccountService,
    private readonly utilityService: UtilityService,
  ) {}

  async check(email: string, company_id: string): Promise<User | undefined> {
    return this.userRepository.findOne({
      where: {
        email: email,
        company: { company_id: company_id },
      },
      relations: ['company'],
    });
  }

  async admit(
    user_id: string,
    company_id: string,
    createUserWithProfileDto: CreateUserWithProfileDto,
  ): Promise<Company> {
    try {
      const user = await this.userRepository.findOne({
        where: { user_id: user_id },
        relations: ['company'],
      });

      const company = await this.companyRepository.findOne({
        where: { company_id },
        relations: ['users'],
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

      if (
        company.company_account_type == COMPANY_ACCOUNT_TYPE.WEB3 ||
        company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
      ) {
        const thirteenxUserAccount =
          await this.thirteenxProviderService.createCustomer(user, user);
        if (!thirteenxUserAccount) {
          // throw new InternalServerErrorException(
          //   `Could not create user account with the provider`,
          // );
        }
      } else if (
        company.company_account_type == COMPANY_ACCOUNT_TYPE.BANKING ||
        company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
      ) {
      }
      const accounts = await this.accountRepository.find({
        where: { user: { user_id: companyUser.user_id } },
        relations: ['asset', 'network'],
      });

      const cryptoPromises = await accounts.map(async (account) => {
        if (
          company.company_account_type == COMPANY_ACCOUNT_TYPE.WEB3 ||
          company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
        ) {
          if (account.asset.type == ASSET_TYPE.CRYPTOCURRENCY) {
            const thirteenxMainWallet =
              await this.thirteenxProviderService.createWallet(
                user,
                null,
                {
                  name: account.asset.name,
                },
                false,
              );
            const dto = new CreateAccountDto();
            dto.company_id = company.company_id;
            dto.user_id = user_id;
            dto.asset_id = account.asset.asset_id;
            dto.account_number = thirteenxMainWallet.address;
            dto.account_detail = thirteenxMainWallet;
            if (!thirteenxMainWallet) {
              throw new InternalServerErrorException(
                `Could not create company crypto account with the provider`,
              );
            }
            this.accountsService.create(dto);
          }
        } else if (
          company.company_account_type == COMPANY_ACCOUNT_TYPE.BANKING ||
          company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
        ) {
          if (account.asset.type == ASSET_TYPE.CRYPTOCURRENCY) {
          }
          if (account.asset.type == ASSET_TYPE.FIAT) {
          }
        }
      });

      const resultsCrypto = await Promise.allSettled(cryptoPromises);

      const tokenPromises = await accounts.map(async (account) => {
        if (
          company.company_account_type == COMPANY_ACCOUNT_TYPE.WEB3 ||
          company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
        ) {
          if (account.asset.type == ASSET_TYPE.TOKEN) {
            const network = account.network;
            const wallets = await this.thirteenxProviderService.getWallets(
              user,
              companyUser,
            );

            const wallet = wallets.find(
              (wallet) => wallet.network === network.name,
            );

            if (wallet) {
              const thirteenxMainWallet =
                await this.thirteenxProviderService.AddToken(
                  user,
                  null,
                  {
                    address: wallet.address,
                  },
                  {
                    name: account.asset.name,
                    testnet: false,
                    blockchain: { name: network.name, testnet: false },
                  },
                );

              const dto = new CreateAccountDto();
              dto.company_id = company.company_id;
              dto.user_id = user_id;
              dto.asset_id = account.asset.asset_id;
              dto.account_number = thirteenxMainWallet.address;
              dto.account_detail = thirteenxMainWallet;
              dto.network_id = network.network_id;

              if (!thirteenxMainWallet) {
                throw new InternalServerErrorException(
                  `Could not create company token account with the provider`,
                );
              }
              this.accountsService.create(dto);
            } else {
              console.log(`No wallet found for network ${network.name}`);
            }
          }
        } else if (
          company.company_account_type == COMPANY_ACCOUNT_TYPE.BANKING ||
          company.company_account_type == COMPANY_ACCOUNT_TYPE.HOLDING
        ) {
          if (account.asset.type == ASSET_TYPE.TOKEN) {
          }
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
        `An error occurred while create asset account with the provider. ${error}`,
      );
    }
  }

  async create(
    createUserWithProfileDto: CreateUserWithProfileDto,
  ): Promise<User> {
    const company = await this.companyRepository.findOne({
      where: { company_id: createUserWithProfileDto.user.company_id },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    const user = await this.userRepository.create({
      ...createUserWithProfileDto.user,
      company,
    });

    let newUser = await this.userRepository.save(user);

    if (company.company_account_type == COMPANY_ACCOUNT_TYPE.BANKING) {
      const ibaneraUserAccount =
        await this.ibaneraProviderService.createCustomer(
          createUserWithProfileDto,
          newUser.user_id,
          company.company_id,
        );
      if (!ibaneraUserAccount) {
        throw new InternalServerErrorException(
          `Could not create user account with the provider`,
        );
      }

      const userProfile = await this.userProfileRepository.create({
        ...createUserWithProfileDto.profile,
        verificationLink: ibaneraUserAccount?.details?.jumioLink,
      });

      await this.userProfileRepository.save(userProfile);
      newUser.userProfile = userProfile;
      newUser.external_id = ibaneraUserAccount?.details?.manageesId;

      newUser = await this.userRepository.save(newUser);

      newUser = await this.userRepository.findOne({
        where: { user_id: newUser.user_id },
        relations: ['userProfile'],
      });
    } else if (company.company_account_type == COMPANY_ACCOUNT_TYPE.WEB3) {
      await this.admit(
        newUser.user_id,
        newUser.company.company_id,
        createUserWithProfileDto,
      );
    }

    return newUser;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['accounts', 'accounts.asset', 'accounts.network'],
    });
  }

  async findByUserId(user_id: string, company_id: string) {
    const company = await this.companyRepository.findOne({
      where: { company_id: company_id },
    });

    return this.userRepository.findOne({
      where: {
        user_id: user_id,
        company: { company_id: company.company_id },
      },
      relations: ['company'],
    });
  }

  async findOneByCompanyId(company_id: string) {
    const company = await this.companyRepository.findOne({
      where: { company_id: company_id },
    });

    return this.userRepository.findOne({
      where: {
        company: { company_id: company.company_id },
      },
      relations: ['company'],
    });
  }

  async findByCompanyId(company_id: string) {
    const company = await this.companyRepository.findOne({
      where: { company_id: company_id },
    });

    const users = await this.userRepository.find({
      where: {
        company: { company_id: company.company_id },
      },
      relations: ['company'],
    });

    users.forEach((user) => {
      delete user.password;
      delete user.refresh_token;
      delete user.authenticator_secret;
    });

    return users;
  }

  async findUserByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    const response = {
      authenticator_secret: false,
      active: false,
    };
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        delete user.password;
        delete user.refresh_token;
        response.authenticator_secret = user.authenticator_secret
          ? true
          : false;
        response.active = user.status;
      }
    }
    return response;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['sessions', 'company', 'company.branding', 'accounts'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findUserByUserId(userId: string, seperate: boolean = false) {
    const user = await this.userRepository.findOne({
      where: {
        user_id: userId,
      },
      relations: {
        userProfile: true,
        permission: true,
        activityLogs: true,
        company: true,
        sessions: true
      },
    });

    if (seperate) {
      return user;
    }
    const userProfile = user.userProfile;
    const userProfileId = userProfile?.id;
    userProfile && delete userProfile.id;
    const data = {
      ...user,
      userProfileId,
      ...userProfile,
    };
    delete data.userProfile;
    return data;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updatePassword(user_id: number, hashedPassword: string): Promise<void> {
    await this.userRepository.update(user_id, { password: hashedPassword });
  }

  async updateEmail(user_id: number, new_email: string): Promise<void> {
    await this.userRepository.update(user_id, { email: new_email });
  }

  async updateFCMToken(user_id: string, fcm_token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { user_id: user_id },
    });
    if (user) {
      user.fcm_token = fcm_token;
      await this.userRepository.save(user);
    }
  }

  async updateStatus(user_id: number, status: boolean): Promise<void> {
    await this.userRepository.update(user_id, { status: status });
  }

  async update2fa(
    user_id: number,
    authenticator_secret: string | null,
  ): Promise<void> {
    await this.userRepository.update(user_id, {
      authenticator_secret: authenticator_secret,
    });
  }

  async updateVerifyPhone(
    user_id: number,
    country_code: string,
    phone_number: string,
  ): Promise<void> {
    await this.userRepository.update(user_id, {
      verify_phone_country_code: country_code,
      verify_phone: phone_number,
    });
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async findById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async getUsersForCompany(companyId: string) {
    const company = await this.companyRepository.findOne({
      where: { company_id: companyId },
    });

    if (!company) {
      throw new NotFoundException(
        `company with id ${companyId} doesnot exists`,
      );
    }

    const teamMembers = await this.userRepository.find({
      where: {
        company: {
          company_id: companyId,
        },
        role: Not(ROLE.END_USER),
      },
      relations: ['userProfile'], // Include userProfile in the result
    });

    teamMembers.forEach((member) => {
      delete member.password;
      delete member.refresh_token;
      delete member.authenticator_secret;
    });

    return teamMembers;
  }

  async getCustomersForCompany(companyId: string) {
    const company = await this.companyRepository.findOne({
      where: { company_id: companyId },
    });

    if (!company) {
      throw new NotFoundException(
        `company with id ${companyId} doesnot exists`,
      );
    }

    const customers = await this.userRepository.find({
      where: {
        company: {
          company_id: companyId,
        },
        role: ROLE.END_USER,
      },
      relations: ['userProfile', 'activityLogs'], // Include userProfile in the result
    });

    customers.forEach((member) => {
      delete member.password;
      delete member.refresh_token;
      delete member.authenticator_secret;
    });

    return customers;
  }

  async createUserProfile(
    profileData: CreateUserProfileDto | UpdateUserProfileDto,
    user: User,
  ) {
    if (profileData.image) {
      const image = profileData.image;
      const extensionMatch = image.match(/\/(.*?);base64,/);
      const extension = extensionMatch ? extensionMatch[1] : 'png';
      const fileName = `${user.first_name}_${user.last_name}_${Date.now()}.${extension}`;
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const path = await this.utilityService.uploadToS3(
        'watpay',
        `assets/${fileName}`,
        buffer,
      );

      profileData.image = path.Location;
    }
    console.log('saved image');
    // Create profile
    const profile = this.userProfileRepository.create({
      ...profileData,
    });

    console.log('created profile', profile);
    await this.userProfileRepository.save(profile);
    return profile;
  }

  async createUserWithProfile(
    createUserWithProfileDto: CreateUserWithProfileDto,
  ) {
    const { user: userData, profile: profileData } = createUserWithProfileDto;

    const company = await this.companyRepository.findOne({
      where: {
        company_id: userData.company_id,
      },
    });

    if (!company) {
      throw new NotFoundException(
        `Company with id ${userData.company_id} cannot be found`,
      );
    }

    // Create user
    const user = await this.authService.registerTeamMember(userData);
    console.log('saved user');
    //upload image
    const profile = await this.createUserProfile(profileData, user);
    console.log('saved profile');

    // Associate profile and company with user
    user.userProfile = profile;
    user.company = company;
    await this.userRepository.save(user);

    return { user, profile };
  }

  async approveUser(approveUser: ApproveUserDto) {
    const user = await this.userRepository.findOne({
      where: { external_id: approveUser?.Data?.ManageesId.toString() },
    });

    if (user) {
      if (approveUser.Data.VerificationStatus == 'Accepted') {
        const result = await this.ibaneraProviderService.listAccount(
          user?.external_id,
        );

        if (result) {
          for (const account of result) {
            const asset = await this.assetRepository.findOne({
              where: {
                ticker: account.asset,
              },
            });

            const accounts = await this.accountRepository.findOne({
              where: {
                asset: { ticker: account.asset },
                account_number: account.accountNumber,
              },
              relations: ['asset'],
            });

            if (asset && !accounts) {
              const accountDetail = {
                account_id: account.id,
                virtual_account_number: account.virtualAccountNumber,
                routing_number: account.routingNumber,
                swift: account.swiftCode,
              };

              const accountData = {
                asset,
                user,
                account_number: account.accountNumber,
                account_detail: accountDetail,
                network: null,
              };

              const createdAccount =
                await this.accountRepository.create(accountData);
              await this.accountRepository.save(createdAccount);
            }
          }

          user.status = true;
          await this.userRepository.save(user);
        }
      }
    }
    return {};
  }

  async updateUserAndUserProfile(
    updateUserWithProfileDto: UpdateUserWithProfileDto,
    userNumericId: number,
  ) {
    let updatedUser: User;
    if (updateUserWithProfileDto.user) {
      updatedUser = await this.update(
        userNumericId,
        updateUserWithProfileDto.user,
      );
    } else {
      updatedUser = await this.userRepository.findOne({
        where: {
          id: userNumericId,
        },
      });
    }

    if (!updatedUser) {
      throw new NotFoundException(`user with id ${userNumericId} is not found`);
    }

    console.dir({ updatedUser }, { depth: null });

    const userWithProfile = await this.userRepository.findOne({
      where: {
        id: updatedUser.id,
      },
      relations: {
        userProfile: true,
      },
    });

    if (updateUserWithProfileDto.profile) {
      const profile = userWithProfile.userProfile;

      if (updateUserWithProfileDto.user?.company_id) {
        const company = await this.companyRepository.findOne({
          where: {
            company_id: updateUserWithProfileDto.user.company_id,
          },
        });

        if (!company) {
          throw new NotFoundException(
            `company with company id ${updateUserWithProfileDto.user.company_id} does not exists`,
          );
        }
        updatedUser.company = company;
      }

      //if profile doesnot exists then create one and assign it to the user
      if (!profile && updateUserWithProfileDto.profile) {
        const userProfile = await this.createUserProfile(
          updateUserWithProfileDto.profile,
          updatedUser,
        );

        updatedUser.userProfile = userProfile;
      } else {
        //if profile does exists then update the image and other values
        if (
          updateUserWithProfileDto.profile.image &&
          profile.image !== updateUserWithProfileDto.profile.image
        ) {
          profile.image &&
            (await this.utilityService.deleteImageByUrl(profile.image));

          const image = profile.image;
          const extensionMatch = image.match(/\/(.*?);base64,/);
          const extension = extensionMatch ? extensionMatch[1] : 'png';
          const fileName = `${updatedUser.first_name}_${updatedUser.last_name}_${Date.now()}.${extension}`;
          const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');

          const path = await this.utilityService.uploadToS3(
            'watpay',
            `assets/${fileName}`,
            buffer,
          );

          updateUserWithProfileDto.profile.image = path.Location;
        }

        Object.assign(profile, updateUserWithProfileDto.profile);
        await this.userProfileRepository.save(profile);
      }
    }

    return this.userRepository.save(updatedUser);
  }
}
