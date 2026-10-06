import { Transform } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { trim } from '../../common/utils.js';

export class CreateStepDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Each step needs a name' })
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsDateString({}, { message: 'Step due date must be a valid date' })
  dueDate?: string | null;
}