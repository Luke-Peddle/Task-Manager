import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ifProvided, toDate } from '../common/utils.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { STEP_ORDER, stepData } from '../steps/utils/steps.helpers.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

const WITH_STEPS = { steps: { orderBy: STEP_ORDER } };

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findTimeline() {
    return this.prisma.task.findMany({
      orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }],
      include: WITH_STEPS,
    });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({ where: { id }, include: WITH_STEPS });
    if (!task) throw new NotFoundException(`Task ${id} doesn't exist.`);
    return task;
  }

  async findCalendar(from: Date, to: Date) {
    const [tasks, steps] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where: { dueDate: { gte: from, lt: to } },
        orderBy: [{ dueDate: 'asc' }, { id: 'asc' }],
        include: WITH_STEPS,
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
    return this.prisma.task.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        dueDate: toDate(dto.dueDate),
        steps: { create: (dto.steps ?? []).map(stepData) },
      },
      include: WITH_STEPS,
    });
  }

  async update(id: number, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { steps: { select: { id: true } } },
    });
    if (!task) throw new NotFoundException(`Task ${id} doesn't exist.`);

    if (dto.steps) {
      const ownIds = new Set(task.steps.map((step) => step.id));
      const foreignIds = dto.steps.flatMap((step) =>
        step.id !== undefined && !ownIds.has(step.id) ? [step.id] : [],
      );
      if (foreignIds.length > 0) {
        throw new BadRequestException(`Steps ${foreignIds.join(', ')} don't belong to this task.`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.steps) {
        const keptIds = dto.steps.flatMap((step) => (step.id !== undefined ? [step.id] : []));
        await tx.step.deleteMany({ where: { taskId: id, id: { notIn: keptIds } } });

        for (const step of dto.steps) {
          if (step.id !== undefined) {
            await tx.step.update({ where: { id: step.id }, data: stepData(step) });
          } else {
            await tx.step.create({ data: { ...stepData(step), taskId: id } });
          }
        }
      }

      if (dto.completed && dto.completeSteps) {
        await tx.step.updateMany({
          where: { taskId: id, completed: false },
          data: { completed: true },
        });
      }

      return tx.task.update({
        where: { id },
        data: {
          name: dto.name,
          description: ifProvided(dto.description, (value) => value || null),
          dueDate: ifProvided(dto.dueDate, toDate),
          completed: dto.completed,
        },
        include: WITH_STEPS,
      });
    });
  }
}