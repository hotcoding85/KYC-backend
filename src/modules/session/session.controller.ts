import { Controller, Get, Param } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get(':userId')
  async getActiveSessions(@Param('userId') userId: string) {
    return await this.sessionService.getActiveSessions(userId);
  }
}
