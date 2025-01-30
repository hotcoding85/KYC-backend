import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UserAccessDto {
  @IsBoolean()
  @IsOptional()
  viewUsers?: boolean;

  @IsBoolean()
  @IsOptional()
  editUsers?: boolean;

  @IsBoolean()
  @IsOptional()
  deleteUsers?: boolean;

  @IsBoolean()
  @IsOptional()
  blockUsers?: boolean;
}

class RoleManagementDto {
  @IsBoolean()
  @IsOptional()
  createRoles?: boolean;

  @IsBoolean()
  @IsOptional()
  assignRoles?: boolean;

  @IsBoolean()
  @IsOptional()
  editRoles?: boolean;
}

class TransactionsDto {
  @IsBoolean()
  @IsOptional()
  viewTransactions?: boolean;

  @IsBoolean()
  @IsOptional()
  approveTransactions?: boolean;

  @IsBoolean()
  @IsOptional()
  exportTransactions?: boolean;
}

class ReportsDto {
  @IsBoolean()
  @IsOptional()
  viewReports?: boolean;

  @IsBoolean()
  @IsOptional()
  generateReports?: boolean;

  @IsBoolean()
  @IsOptional()
  downloadReports?: boolean;
}

class GeneralSettingsDto {
  @IsBoolean()
  @IsOptional()
  editGeneralSettings?: boolean;

  @IsBoolean()
  @IsOptional()
  changePlatformPreferences?: boolean;

}

class SecurityDto {
  @IsBoolean()
  @IsOptional()
  manageSecuritySettings?: boolean;

  @IsBoolean()
  @IsOptional()
  viewSecurityLogs?: boolean;
}

export class PermissionsDto {
  @IsBoolean()
  @IsOptional()
  userAccess?: boolean;

  @ValidateNested()
  @Type(() => UserAccessDto)
  @IsOptional()
  userAccessDetails?: UserAccessDto;

  @IsBoolean()
  @IsOptional()
  roleManagement?: boolean;

  @ValidateNested()
  @Type(() => RoleManagementDto)
  @IsOptional()
  roleManagementDetails?: RoleManagementDto;

  @IsBoolean()
  @IsOptional()
  transactions?: boolean;

  @ValidateNested()
  @Type(() => TransactionsDto)
  @IsOptional()
  transactionsDetails?: TransactionsDto;

  @IsBoolean()
  @IsOptional()
  reports?: boolean;

  @ValidateNested()
  @Type(() => ReportsDto)
  @IsOptional()
  reportsDetails?: ReportsDto;

  @IsBoolean()
  @IsOptional()
  generalSettings?: boolean;

  @ValidateNested()
  @Type(() => GeneralSettingsDto)
  @IsOptional()
  generalSettingsDetails?: GeneralSettingsDto;

  @IsBoolean()
  @IsOptional()
  security?: boolean;

  @ValidateNested()
  @Type(() => SecurityDto)
  @IsOptional()
  securityDetails?: SecurityDto;
}
