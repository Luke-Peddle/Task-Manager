import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

const toDate = (value?: string | null) => (value ? new Date(value) : null);

const STEP_ORDER = [{ dueDate: { sort: 'asc' as const, nulls: 'last' as const } }, { id: 'asc' as const }];

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findTimeline() {
    return this.prisma.task.findMany({
      orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }],
      include: { steps: { orderBy: STEP_ORDER } },
    });
  }

  async findCalendar(from: Date, to: Date) {
    const [tasks, steps] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where: { dueDate: { gte: from, lt: to } },
        orderBy: [{ dueDate: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          name: true,
          dueDate: true,
          completed: true,
          steps: { orderBy: STEP_ORDER, select: { id: true, name: true, completed: true } },
        },
      }),
      this.prisma.step.findMany({
        where: { dueDate: { gte: from, lt: to } },
        orderBy: STEP_ORDER,
        include: { task: { select: { id: true, name: true } } },
      }),
    ]);

    return { tasks, steps };
  }

  create(dto: CreateTaskDto) {
    const steps = dto.steps ?? [];

    return this.prisma.task.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        dueDate: toDate(dto.dueDate),
        steps: {
          create: steps.map((step) => ({
            name: step.name,
            description: step.description || null,
            dueDate: toDate(step.dueDate),
          })),
        },
      },
      include: { steps: { orderBy: STEP_ORDER } },
    });
  }

  async updateTask(id: number, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException(`Task ${id} doesn't exist.`);

    const updateTask = this.prisma.task.update({
      where: { id },
      data: { completed: dto.completed },
      include: { steps: { orderBy: STEP_ORDER } },
    });

    if (dto.completed && dto.completeSteps) {
      const [, updated] = await this.prisma.$transaction([
        this.prisma.step.updateMany({
          where: { taskId: id, completed: false },
          data: { completed: true },
        }),
        updateTask,
      ]);
      return updated;
    }

    return updateTask;
  }

  async updateStep(id: number, completed: boolean) {
    const step = await this.prisma.step.findUnique({ where: { id } });
    if (!step) throw new NotFoundException(`Step ${id} doesn't exist.`);

    return this.prisma.step.update({ where: { id }, data: { completed } });
  }
}