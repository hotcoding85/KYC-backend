import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityQuestion } from './entities/security.entity';
import { SecurityQuestionController } from './security-controller';
import { SecurityQuestionService } from './security-service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([SecurityQuestion]), forwardRef(() => UserModule),],
  controllers: [SecurityQuestionController],
  providers: [SecurityQuestionService],
})
export class SecurityQuestionModule {}
