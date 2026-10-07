import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { trim } from '../../common/utils.js';

export class UpdateStepDto {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ValidateIf((dto: UpdateStepDto) => dto.name !== undefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Step name is required' })
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsDateString({}, { message: 'Step due date must be a valid date' })
  dueDate?: string | null;
}