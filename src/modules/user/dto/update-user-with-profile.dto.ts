import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { UpdateUserProfileDto } from './update-user-profile.dto';
import { UpdateUserDto } from './update-user.dto';

export class UpdateUserWithProfileDto {
  @IsOptional()
  @Type(() => UpdateUserDto)
  user?: UpdateUserDto;

  @IsOptional()
  @Type(() => UpdateUserProfileDto)
  profile?: UpdateUserProfileDto;
}
