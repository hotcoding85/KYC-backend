import {
  Controller,
  Request,
  Get,
  Req,
  Patch,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Post,
  HttpException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { AllowApiCall } from '../../common/decorators/allow-api-call.decorator';
import { UpdateUserWithProfileDto } from './dto/update-user-with-profile.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { Request as ERequest } from 'express';
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly firebaseService: FirebaseService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @AllowApiCall()
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: Request): Promise<User> {
    const userId = req['user'].id;
    return this.userService.findOne(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    console.log(id)
    return this.userService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/company/:company_id')
  async getUserByCompanyId(@Param('company_id') companyId: string) {
    return this.userService.findByCompanyId(companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update')
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    const userId = req['user'].id;
    const user = this.userService.updateUser(userId, updateUserDto);
    if (user) {
      return {
        status: 'success',
        message: 'Profile successfully udpated',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/getNotifications/:id/:page/:pageSize')
  async getNotifications(@Req() req: Request, @Param('id') id: string, @Param('page') page: number, @Param('pageSize') pageSize: number) {
    const userId = id;
    return this.firebaseService.getNotifications(userId, page, pageSize);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/markNotificationsAsRead/:userId')
  async markNotificationsAsRead(@Body('ids') ids: string[], @Param('userId') userId: string) {
    return this.firebaseService.markNotificationsAsRead(userId, ids);
  }

  @UseGuards(JwtAuthGuard)
    @Delete('/removeNotification/:id/:userId')
    async removeNotification(@Param('id') id: string, @Param('userId') userId: string): Promise<{ success: boolean; message: string }> {
        return this.firebaseService.remove(userId, id);
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Get('/company/:company_id')
  getTeamMemberByCompanyId(@Param('company_id') companyId: string) {
    return this.userService.getUsersForCompany(companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/user/:userId')
  async getUserByUserId(@Param('userId') userId: string) {
    return this.userService.findUserByUserId(userId);
  }

  @Post('approve')
  async approve(@Request() req): Promise<any> {
    try {
      const stats = await this.userService.approveUser(req?.body);
      return stats;
    } catch (error) {
      console.error('Error fetching managee stats:', error);
      throw new HttpException(error.message, error.status || 500);
    }
  }
}
