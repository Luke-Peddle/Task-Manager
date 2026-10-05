import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { TasksService } from './tasks.service.js';

const MAX_LIMIT = 100;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.tasksService.findPaginated(Math.max(page, 1), clamp(limit, 1, MAX_LIMIT));
  }

  @Get('stats')
  stats() {
    return this.tasksService.getStats();
  }

  @Get('upcoming')
  upcoming(@Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number) {
    return this.tasksService.findUpcoming(clamp(limit, 1, MAX_LIMIT));
  }

  @Get('overdue')
  overdue(@Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number) {
    return this.tasksService.findOverdue(clamp(limit, 1, MAX_LIMIT));
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }
}