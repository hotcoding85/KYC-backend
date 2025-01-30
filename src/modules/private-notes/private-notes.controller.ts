import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PrivateNotesService } from './private-notes.service';
import { CreatePrivateNoteDto } from './dto/create-private-note.dto';
import { EditPrivateNoteDto } from './dto/edit-private-note.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('private-notes')
@UseGuards(JwtAuthGuard)
export class PrivateNotesController {
  constructor(private readonly privateNotesService: PrivateNotesService) {}

  @Post()
  create(@Request() req, @Body() createPrivateNoteDto: CreatePrivateNoteDto) {
    return this.privateNotesService.create(req.user.id, createPrivateNoteDto);
  }

  @Get(':company_id')
  findOne(@Param('company_id') companyId: string, @Request() req) {
    return this.privateNotesService.findOne(companyId, req.user.id);
  }

  @Patch(':note_id')
  update(
    @Param('note_id') privateNoteId: string,
    @Request() req,
    @Body() updatePrivateNoteDto: EditPrivateNoteDto,
  ) {
    return this.privateNotesService.update(
      privateNoteId,
      req.user.id,
      updatePrivateNoteDto,
    );
  }

  @Patch('/company/:company_id')
  createOrUpdateForCompany(
    @Param('company_id') companyId: string,
    @Request() req,
    @Body() updatePrivateNoteDto: EditPrivateNoteDto,
  ) {
    return this.privateNotesService.createOrUpdateForCOmpany(
      companyId,
      req.user.id,
      updatePrivateNoteDto,
    );
  }

  @Delete(':note_id')
  remove(@Param('note_id') privateNoteId: string, @Request() req) {
    return this.privateNotesService.remove(privateNoteId, req.user.id);
  }
}
