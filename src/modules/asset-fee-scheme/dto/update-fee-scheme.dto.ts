import { PartialType } from '@nestjs/mapped-types';
import { CreateFeeSchemeDto } from './create-fee-scheme.dto';

export class UpdateFeeSchemeDto extends PartialType(CreateFeeSchemeDto) {}
