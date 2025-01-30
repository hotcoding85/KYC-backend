// sweep-schedule.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SweepScheduleService } from './sweep-schedule.service';
import { CreateSweepScheduleDto } from './dto/create-sweep-schedule.dto';
import { UpdateSweepScheduleDto } from './dto/update-sweep-schedule.dto';

@Controller('sweep-schedules')
export class SweepScheduleController {
  constructor(private readonly sweepScheduleService: SweepScheduleService) {}

  @Post()
  create(@Body() createSweepScheduleDto: CreateSweepScheduleDto) {
    return this.sweepScheduleService.create(createSweepScheduleDto);
  }

  @Get('/asset/:assetId')
  findAll(@Param('assetId') assetId: string) {
    return this.sweepScheduleService.findAll(assetId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sweepScheduleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSweepScheduleDto: UpdateSweepScheduleDto) {
    return this.sweepScheduleService.update(id, updateSweepScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sweepScheduleService.remove(id);
  }
}
