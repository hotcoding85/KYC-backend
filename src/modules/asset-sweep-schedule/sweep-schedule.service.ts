// sweep-schedule.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSweepScheduleDto } from './dto/create-sweep-schedule.dto';
import { UpdateSweepScheduleDto } from './dto/update-sweep-schedule.dto';
import { SweepSchedule } from './entity/sweep-schedule.entity';
import { Network } from '../asset-networks/entity/networks.entity';
import { Asset } from '../asset/entities/asset.entity';

@Injectable()
export class SweepScheduleService {
    constructor(
        @InjectRepository(SweepSchedule)
        private readonly sweepScheduleRepository: Repository<SweepSchedule>,
        @InjectRepository(Network)
        private networkRepository: Repository<Network>,
        @InjectRepository(Asset)
        private assetRepository: Repository<Asset>,
    ) {}

    async create(createSweepScheduleDto: CreateSweepScheduleDto): Promise<SweepSchedule> {
        const sweepSchedule = this.sweepScheduleRepository.create(createSweepScheduleDto);
        const asset = await this.assetRepository.findOne({
            where: { asset_id: createSweepScheduleDto.assetId },
        });
        if (!asset) {
            throw new NotFoundException(
            `Network with ID ${createSweepScheduleDto.assetId} not found`,
            );
        }
        sweepSchedule.asset = asset
        return this.sweepScheduleRepository.save(sweepSchedule);
    }

    findAll(assetId: string): Promise<SweepSchedule[]> {
        return this.sweepScheduleRepository.find({
            where: {
                asset: {asset_id: assetId}
            }
        });
    }

    async findOne(id: string): Promise<SweepSchedule> {
        const sweepSchedule = await this.sweepScheduleRepository.findOne({
            where: { sweep_schedule_id: id },
            relations: {
            asset: true,
            },
        });
        if (!sweepSchedule) {
        throw new NotFoundException(`SweepSchedule with ID ${id} not found`);
        }
        return sweepSchedule;
    }

    async update(id: string, updateSweepScheduleDto: UpdateSweepScheduleDto): Promise<SweepSchedule> {
        const sweepSchedule = await this.sweepScheduleRepository.findOne({
            where: { sweep_schedule_id: id },
        });
    
        if (updateSweepScheduleDto.assetId) {
            const asset = await this.assetRepository.findOne({
            where: { asset_id: updateSweepScheduleDto.assetId },
            });
            if (!asset) {
            throw new NotFoundException(
                `Network with ID ${updateSweepScheduleDto.assetId} not found`,
            );
            }
            sweepSchedule.asset = asset;
        }
    
        Object.assign(sweepSchedule, updateSweepScheduleDto);
        return this.sweepScheduleRepository.save(sweepSchedule);
    }

    async remove(id: string): Promise<void> {
        const sweepSchedule = await this.findOne(id);
        await this.sweepScheduleRepository.remove(sweepSchedule);
    }
}
