import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entity/user-permission.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { PermissionsDto } from './dto/user-permission.dto';
import { ActivityLog } from './entity/user-activity-logs.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';

@Injectable()
export class CompanyTeamsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async createOrUpdatePermissions(
    userId: string,
    permissionsDto: PermissionsDto,
  ): Promise<Permission> {
    const user = await this.userRepository.findOne({
      where: {
        user_id: userId,
      },
      relations: {
        permission: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    let permission = user.permission;
    if (!permission) {
      permission = new Permission();
      permission.user = user;
    }

    permission = this.mapDtoToEntity(permission, permissionsDto);
    return this.permissionRepository.save(permission);
  }

  async getPermissionsByUserId(userId: string): Promise<Permission> {
    const user = await this.userRepository.findOne({
      where: {
        user_id: userId,
      },
      relations: {
        permission: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    if (!user.permission) {
      throw new NotFoundException(
        `Permissions for user with ID "${userId}" not found`,
      );
    }
    return user.permission;
  }

  async deletePermissions(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        user_id: userId,
      },
      relations: {
        permission: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
    if (user.permission) {
      await this.permissionRepository.remove(user.permission);
    }
  }

  private mapDtoToEntity(
    permission: Permission,
    dto: PermissionsDto,
  ): Permission {
    // Map top-level permissions
    permission.userAccess = dto.userAccess ?? permission.userAccess;
    permission.roleManagement = dto.roleManagement ?? permission.roleManagement;
    permission.transactions = dto.transactions ?? permission.transactions;
    permission.reports = dto.reports ?? permission.reports;
    permission.generalSettings =
      dto.generalSettings ?? permission.generalSettings;
    permission.security = dto.security ?? permission.security;

    // Map nested permissions
    if (dto.userAccessDetails) {
      permission.viewUsers =
        dto.userAccessDetails.viewUsers ?? permission.viewUsers;
      permission.editUsers =
        dto.userAccessDetails.editUsers ?? permission.editUsers;
      permission.deleteUsers =
        dto.userAccessDetails.deleteUsers ?? permission.deleteUsers;
      permission.blockUsers =
        dto.userAccessDetails.blockUsers ?? permission.blockUsers;
    }

    if (dto.roleManagementDetails) {
      permission.createRoles =
        dto.roleManagementDetails.createRoles ?? permission.createRoles;
      permission.assignRoles =
        dto.roleManagementDetails.assignRoles ?? permission.assignRoles;
      permission.editRoles =
        dto.roleManagementDetails.editRoles ?? permission.editRoles;
    }

    if (dto.transactionsDetails) {
      permission.viewTransactions =
        dto.transactionsDetails.viewTransactions ?? permission.viewTransactions;
      permission.approveTransactions =
        dto.transactionsDetails.approveTransactions ??
        permission.approveTransactions;
      permission.exportTransactions =
        dto.transactionsDetails.exportTransactions ??
        permission.exportTransactions;
    }

    if (dto.reportsDetails) {
      permission.viewReports =
        dto.reportsDetails.viewReports ?? permission.viewReports;
      permission.downloadReports =
        dto.reportsDetails.downloadReports ?? permission.downloadReports;
      permission.generateReports =
        dto.reportsDetails.generateReports ?? permission.generateReports;
    }

    if (dto.generalSettingsDetails) {
      permission.editGeneralSettings =
        dto.generalSettingsDetails.editGeneralSettings ??
        permission.editGeneralSettings;
      permission.changePlatformPreferences =
        dto.generalSettingsDetails.changePlatformPreferences ??
        permission.changePlatformPreferences;
    }

    if (dto.securityDetails) {
      permission.manageSecuritySettings =
        dto.securityDetails.manageSecuritySettings ??
        permission.manageSecuritySettings;
      permission.viewSecurityLogs =
        dto.securityDetails.viewSecurityLogs ?? permission.viewSecurityLogs;
    }

    return permission;
  }

  async createActivityLog(createActivityLogDto: CreateActivityLogDto) {
    const user = await this.userRepository.findOne({
      where: {
        user_id: createActivityLogDto.user_id,
      },
    });

    if (!user) {
      throw new NotFoundException(
        `user with id ${createActivityLogDto.user_id} does not exists`,
      );
    }

    const activityLog = this.activityLogRepository.create(createActivityLogDto);
    activityLog.user = user;
    return await this.activityLogRepository.save(activityLog);
  }

  async findAllActivityLogs() {
    return await this.activityLogRepository.find({ relations: ['user'] });
  }

  async findAllActivityLogsForUser(userId: string) {
    console.log('user id for activity logs', userId);
    return await this.activityLogRepository.find({
      where: {
        user: {
          user_id: userId,
        },
      },
      relations: {
        user: true,
      },
    });
  }

  async findOneActivityLog(activityLogId: string) {
    return await this.activityLogRepository.findOne({
      where: { activity_id: activityLogId },
      relations: {
        user: true,
      },
    });
  }

  async updateActivityLog(
    activityLogId: string,
    updateActivityLogDto: UpdateActivityLogDto,
  ) {
    await this.activityLogRepository.update(
      { activity_id: activityLogId },
      updateActivityLogDto,
    );
    return this.findOneActivityLog(activityLogId);
  }

  async removeActivityLog(activityLogId: string) {
    await this.activityLogRepository.delete({ activity_id: activityLogId });
  }
}
