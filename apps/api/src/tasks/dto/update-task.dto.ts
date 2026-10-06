import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTaskDto {
  @IsBoolean()
  completed!: boolean;

  @IsOptional()
  @IsBoolean()
  completeSteps?: boolean;
}