import { IsNotEmpty, IsString } from '@nestjs/class-validator';
import { IsUUID } from 'class-validator';

export class CreatePrivateNoteDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  companyId: string;
}
