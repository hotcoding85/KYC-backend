import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from './entities/setting.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly settingsRepository: Repository<UserSettings>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getSettings(userId: number): Promise<UserSettings> {
    return this.settingsRepository.findOne({ where: { userId:  userId } });
  }

  async updateSettings(userId: number, updateData: Partial<UserSettings>): Promise<UserSettings> {
    const user = await this.userRepository.findOne({
        where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }

    let settings = await this.settingsRepository.findOne({ where: { userId } });
    if (!settings) {
      settings = this.settingsRepository.create({ userId });
    }

    Object.assign(settings, updateData);
    return this.settingsRepository.save(settings);
  }

  async createSettings(newSettings: Partial<UserSettings>): Promise<UserSettings> {
    // Check if settings for the user already exist
    const existingSettings = await this.settingsRepository.findOne({
      where: {userId: newSettings.userId  },
    });

    if (existingSettings) {
      return existingSettings; // Skip creation if settings already exist
    }

    // Resolve the User entity
    const user = await this.userRepository.findOne({ where: { id: newSettings.userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const settings = this.settingsRepository.create({
      ...newSettings,
    });

    return this.settingsRepository.save(settings);
  }
}
