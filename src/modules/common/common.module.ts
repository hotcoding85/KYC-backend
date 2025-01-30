import { Module } from '@nestjs/common';
import { UtilityService } from './utility/utility.service';

@Module({
  providers: [UtilityService],
  exports: [UtilityService],
})
export class CommonModule {}
