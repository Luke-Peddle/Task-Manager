import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';

const DAY_MS = 86_400_000;

const toDate = (value?: string | null) => (value ? new Date(value) : null);

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findPaginated(page: number, limit: number) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }],
        include: { steps: { orderBy: { id: 'asc' } } },
      }),
      this.prisma.task.count(),
    ]);

    return { data, total, page, limit };
  }

  async getStats() {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * DAY_MS);

    const [total, overdue, dueThisWeek, totalSteps] = await this.prisma.$transaction([
      this.prisma.task.count(),
      this.prisma.task.count({ where: { dueDate: { lt: now } } }),
      this.prisma.task.count({ where: { dueDate: { gte: now, lte: weekFromNow } } }),
      this.prisma.step.count(),
    ]);

    return { total, overdue, dueThisWeek, totalSteps };
  }

  findUpcoming(limit: number) {
    return this.prisma.task.findMany({
      where: { dueDate: { gte: new Date() } },
      orderBy: { dueDate: 'asc' },
      take: limit,
      include: { steps: true },
    });
  }

  findOverdue(limit: number) {
    return this.prisma.task.findMany({
      where: { dueDate: { lt: new Date() } },
      orderBy: { dueDate: 'asc' },
      take: limit,
      include: { steps: true },
    });
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
      include: { steps: { orderBy: { id: 'asc' } } },
    });
  }
}