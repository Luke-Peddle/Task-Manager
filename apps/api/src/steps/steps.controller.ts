import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { UpdateStepDto } from './dto/update-step.dto.js';
import { StepsService } from './steps.service.js';

@Controller('steps')
export class StepsController {
  constructor(private readonly stepsService: StepsService) {}

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStepDto) {
    return this.stepsService.update(id, dto);
  }
}