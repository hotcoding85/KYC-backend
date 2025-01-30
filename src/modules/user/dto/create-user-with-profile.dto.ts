import { IsNotEmpty, ValidateNested, IsObject, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import { CreateUserProfileDto } from './create-user-profile.dto';
import { CreateUserOnboardingDto} from './create-user-onboarding.dto';

export class CreateUserWithProfileDto {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateUserProfileDto)
  profile: CreateUserProfileDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateUserOnboardingDto)
  onboarding: CreateUserOnboardingDto;
}
