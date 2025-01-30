import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { FirebaseService } from './firebase.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    CommonModule
  ],
  controllers: [NotificationsController],
  providers: [FirebaseService],
  exports: [FirebaseService]
})
export class FirebaseModule {}
