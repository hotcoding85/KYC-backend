import { Module } from '@nestjs/common';
import { PrivateNotesService } from './private-notes.service';
import { PrivateNotesController } from './private-notes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivateNotes } from './entity/private-notes.entity';
import { User } from '../user/entities/user.entity';
import { Company } from '../company/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PrivateNotes, User, Company])],
  providers: [PrivateNotesService],
  controllers: [PrivateNotesController],
})
export class PrivateNotesModule {}
