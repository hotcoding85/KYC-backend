import { Controller, Get, Put, Body, Param, Post } from '@nestjs/common';
import { SettingsService } from './setting.service';
import { UserSettings } from './entities/setting.entity';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':userId')
  async getUserSettings(@Param('userId') userId: number): Promise<{ status: string; settings: UserSettings | null }> {
    const settings = await this.settingsService.getSettings(userId);
    if (!settings) {
      return { status: 'success', settings: null };
    }
    return { status: 'success', settings };
  }

  @Put(':userId')
  async updateUserSettings(
    @Param('userId') userId: number,
    @Body() updateData: Partial<UserSettings>,
  ): Promise<{ status: string; settings: UserSettings }> {
    const updatedSettings = await this.settingsService.updateSettings(userId, updateData);
    return { status: 'success', settings: updatedSettings };
  }

  @Post(':userId')
  async createUserSettings(
    @Body() newSettings: { userId: number; allNotifications?: boolean; news?: boolean; promotions?: boolean; preferredLanguage?: string; preferredCurrency?: string },
  ): Promise<{ status: string; settings: UserSettings }> {
    const settingsData = {
      ...newSettings,
      user: { id: newSettings.userId }, // Pass userId as part of the user object
    };

    const createdSettings = await this.settingsService.createSettings(settingsData);
    return { status: 'success', settings: createdSettings };
  }
}
