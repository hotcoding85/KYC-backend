import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserWithProfileDto } from '../user/dto/create-user-with-profile.dto';
import { UpdateUserWithProfileDto } from '../user/dto/update-user-with-profile.dto';
import { PermissionsDto } from './dto/user-permission.dto';
import { CompanyTeamsService } from './company-teams.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';

@Controller('company-teams')
export class CompanyTeamsController {
  constructor(
    private readonly userService: UserService,
    private companyTeamService: CompanyTeamsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/company/:company_id')
  getTeamMemberByCompanyId(@Param('company_id') companyId: string) {
    return this.userService.getUsersForCompany(companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/create-user-with-profile')
  async createUserWithProfile(
    @Body() createUserWithProfileDto: CreateUserWithProfileDto,
  ) {
    return this.userService.createUserWithProfile(createUserWithProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/:userId')
  async getUserByUserId(@Param('userId') userId: string) {
    return this.userService.findUserByUserId(userId, true);
  }

  //the user id param is the numneric id of the user, not uuid one
  @Patch('/update-user/:userId')
  async updateUserWithProfile(
    @Param('userId') id: number,
    @Body() updateUserWithPRofileDto: UpdateUserWithProfileDto,
  ) {
    return this.userService.updateUserAndUserProfile(
      updateUserWithPRofileDto,
      id,
    );
  }

  @Post('/permission/:userId')
  async createPermissions(
    @Param('userId') userId: string,
    @Body() permissionsDto: PermissionsDto,
  ) {
    return this.companyTeamService.createOrUpdatePermissions(
      userId,
      permissionsDto,
    );
  }

  @Get('/permission/:userId')
  async getPermissions(@Param('userId') userId: string) {
    return this.companyTeamService.getPermissionsByUserId(userId);
  }

  @Put('/permission/:userId')
  async updatePermissions(
    @Param('userId') userId: string,
    @Body() permissionsDto: PermissionsDto,
  ) {
    return this.companyTeamService.createOrUpdatePermissions(
      userId,
      permissionsDto,
    );
  }

  @Delete('/permission/:user_id')
  async deletePermissions(@Param('user_id') userId: string) {
    return this.companyTeamService.deletePermissions(userId);
  }

  //--------------------------------

  @Post('/activity-log')
  create(@Body() createActivityLogDto: CreateActivityLogDto) {
    return this.companyTeamService.createActivityLog(createActivityLogDto);
  }

  @Get('/activity-log')
  findAll() {
    return this.companyTeamService.findAllActivityLogs();
  }

  @Get('/activity-log/user/:userId')
  findAllForUser(@Param('userId') userId: string) {
    return this.companyTeamService.findAllActivityLogsForUser(userId);
  }

  @Get('/activity-log/:activity_log_id')
  findOne(@Param('activity_log_id') activityLogId: string) {
    return this.companyTeamService.findOneActivityLog(activityLogId);
  }

  @Patch('/activity-log/:activity_log_id')
  update(
    @Param('activity_log_id') activityLogId: string,
    @Body() updateActivityLogDto: UpdateActivityLogDto,
  ) {
    return this.companyTeamService.updateActivityLog(
      activityLogId,
      updateActivityLogDto,
    );
  }

  @Delete('/activity-log/:activity_log_id')
  remove(@Param('activity_log_id') activityLogId: string) {
    return this.companyTeamService.removeActivityLog(activityLogId);
  }
}
