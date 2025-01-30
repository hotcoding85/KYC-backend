// update-sweep-schedule.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateSweepScheduleDto } from './create-sweep-schedule.dto';

export class UpdateSweepScheduleDto extends PartialType(CreateSweepScheduleDto) {}
