import { Controller, Get, Put, Body, Param, Post, Delete } from '@nestjs/common';
import { SecurityQuestionService } from './security-service';
import { UpdateSecurityQuestionsDto } from './dto/security-question-update.dto';

@Controller('security-questions')
export class SecurityQuestionController {
  constructor(private readonly securityQuestionService: SecurityQuestionService) {}

  @Get(':userId')
  async getQuestions(@Param('userId') userId: string) {
    const questions = await this.securityQuestionService.getQuestionsByUserId(userId);

    return { status: 'success', questions: questions };
  }

  @Put(':userId')
  async updateQuestions(
    @Param('userId') userId: string,
    @Body() dto: UpdateSecurityQuestionsDto,
  ) {
    const updatedQuestion = await this.securityQuestionService.updateQuestions(userId, dto);
    return { status: 'success', questions: updatedQuestion };
  }

  @Post(':userId')
  async createQuestions(
    @Param('userId') userId: string,
    @Body() dto: UpdateSecurityQuestionsDto,
  ) {
    const createdQuestion = await this.securityQuestionService.createQuestions(userId, dto);
    return { status: 'success', questions: createdQuestion };
  }

  @Delete(':userId')
  async deleteQuestions(@Param('userId') userId: string) {
    await this.securityQuestionService.deleteQuestionsByUserId(userId);
    return { status: 'success', message: `All security questions for user ${userId} have been deleted.` };
  }
}
