import { PartialType } from '@nestjs/mapped-types';
import { CreatePrivateNoteDto } from './create-private-note.dto';

export class EditPrivateNoteDto extends PartialType(CreatePrivateNoteDto) {}
