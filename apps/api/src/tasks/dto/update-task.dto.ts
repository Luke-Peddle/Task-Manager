import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { trim } from '../../common/utils.js';
import { CreateStepDto } from '../../steps/dto/create-step.dto.js';

export class TaskStepInputDto extends CreateStepDto {
  @IsOptional()
  @IsInt()
  id?: number;
}

export class UpdateTaskDto {
  @ValidateIf((dto: UpdateTaskDto) => dto.name !== undefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Task name is required' })
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid date' })
  dueDate?: string | null;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsBoolean()
  completeSteps?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskStepInputDto)
  steps?: TaskStepInputDto[];
}