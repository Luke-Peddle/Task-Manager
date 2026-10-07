import { Injectable, NotFoundException } from '@nestjs/common';
import { ifProvided, toDate } from '../common/utils.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateStepDto } from './dto/update-step.dto.js';

@Injectable()
export class StepsService {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: number, dto: UpdateStepDto) {
    const step = await this.prisma.step.findUnique({ where: { id } });
    if (!step) throw new NotFoundException(`Step ${id} doesn't exist.`);

    return this.prisma.step.update({
      where: { id },
      data: {
        completed: dto.completed,
        name: dto.name,
        description: ifProvided(dto.description, (value) => value || null),
        dueDate: ifProvided(dto.dueDate, toDate),
      },
    });
  }
}