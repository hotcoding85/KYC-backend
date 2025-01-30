// src/session/session.module.ts

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { SessionService } from './session.service';
import { Session } from './entities/session.entity';
import { User } from '../user/entities/user.entity';
import { SessionController } from './session.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session, User]),
    forwardRef(() => UserModule),
  ],
  providers: [SessionService],
  exports: [SessionService],
  controllers: [SessionController],
})
export class SessionModule {}
