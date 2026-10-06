import { IsBoolean } from 'class-validator';

export class UpdateStepDto {
  @IsBoolean()
  completed!: boolean;
}