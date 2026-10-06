import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { trim } from '../../common/utils.js';
import { CreateStepDto } from '../../steps/dto/create-step.dto.js';

export class CreateTaskDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Task name is required' })
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid date' })
  dueDate?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStepDto)
  steps?: CreateStepDto[];
}