import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSecurityQuestionsDto {
  @IsNotEmpty()
  @IsString()
  question1: string;

  @IsNotEmpty()
  @IsString()
  answer1: string;

  @IsNotEmpty()
  @IsString()
  question2: string;

  @IsNotEmpty()
  @IsString()
  answer2: string;

  @IsNotEmpty()
  @IsString()
  question3: string;

  @IsNotEmpty()
  @IsString()
  answer3: string;
}
