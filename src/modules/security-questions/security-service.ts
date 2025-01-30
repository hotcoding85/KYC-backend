import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityQuestion } from './entities/security.entity';
import { UpdateSecurityQuestionsDto } from './dto/security-question-update.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class SecurityQuestionService {
  constructor(
    @InjectRepository(SecurityQuestion)
    private readonly securityQuestionRepository: Repository<SecurityQuestion>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async getQuestionsByUserId(userId: string): Promise<SecurityQuestion> {
    const user = await this.userService.findUserByUserId(userId);
    const questions = await this.securityQuestionRepository.findOne({
        where: { userId: user.id },
    });
    return questions;
  }

  async updateQuestions(userId: string, dto: UpdateSecurityQuestionsDto): Promise<SecurityQuestion> {
    const user = await this.userService.findUserByUserId(userId);
    // Remove existing security questions for the user
    if (user) {
      const user_id = user.id
      await this.securityQuestionRepository.delete({ userId: user_id });
      let questions = await this.securityQuestionRepository.findOne({
          where: { userId: user_id },
      });
      if (!questions) {
        questions = this.securityQuestionRepository.create({ userId: user.id, ...dto });
      } else {
        Object.assign(questions, dto);
      }
      return this.securityQuestionRepository.save(questions);
    }
  }

  async createQuestions(userId: string, dto: UpdateSecurityQuestionsDto): Promise<SecurityQuestion> {
    const user = await this.userService.findUserByUserId(userId);
    // Check if questions already exist for the user
    const existingQuestions = await this.securityQuestionRepository.findOne({
        where: { userId: user.id },
    });;
    if (existingQuestions) {
        return existingQuestions;
    }
  
    // Create new security questions
    const newQuestions = this.securityQuestionRepository.create({ userId: user.id, ...dto });
    return this.securityQuestionRepository.save(newQuestions);
  }

  async deleteQuestionsByUserId(userId: string): Promise<void> {
    const user = await this.userService.findUserByUserId(userId);
    await this.securityQuestionRepository.delete({ userId: user.id });
  }
}
