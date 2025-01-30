import { SetMetadata } from '@nestjs/common';

export const ALLOW_API_CALL = 'allowApiCall';
export const AllowApiCall = () => SetMetadata(ALLOW_API_CALL, true);
