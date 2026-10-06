import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateStepDto } from './dto/update-step.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TasksService } from './tasks.service.js';

const MAX_CALENDAR_RANGE_MS = 100 * 86_400_000;

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('timeline')
  timeline() {
    return this.tasksService.findTimeline();
  }

  @Get('calendar')
  calendar(@Query('from') from?: string, @Query('to') to?: string) {
    const start = new Date(from ?? '');
    const end = new Date(to ?? '');

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      throw new BadRequestException('Provide valid "from" and "to" dates, with "from" before "to".');
    }
    if (end.getTime() - start.getTime() > MAX_CALENDAR_RANGE_MS) {
      throw new BadRequestException('The date range can be at most 100 days.');
    }

    return this.tasksService.findCalendar(start, end);
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Patch('steps/:stepId')
  updateStep(@Param('stepId', ParseIntPipe) stepId: number, @Body() dto: UpdateStepDto) {
    return this.tasksService.updateStep(stepId, dto.completed);
  }

  @Patch(':taskId')
  updateTask(@Param('taskId', ParseIntPipe) taskId: number, @Body() dto: UpdateTaskDto) {
    return this.tasksService.updateTask(taskId, dto);
  }
}