import { toDate } from '../../common/utils.js';
import { CreateStepDto } from '../dto/create-step.dto.js';
import { BadRequestException } from '@nestjs/common';


export const STEP_ORDER = [
  { dueDate: { sort: 'asc' as const, nulls: 'last' as const } },
  { id: 'asc' as const },
];

export const stepData = (step: CreateStepDto) => ({
  name: step.name,
  description: step.description || null,
  dueDate: toDate(step.dueDate),
});

export function assertStepsWithinTaskDueDate(
  steps: { name: string; dueDate: Date | null }[],
  taskDueDate: Date | null,
) {
  if (!taskDueDate) return;
  const late = steps.filter((step) => step.dueDate && step.dueDate > taskDueDate);
  if (late.length === 0) return;
 
  const names = late.map((step) => `"${step.name}"`).join(', ');
  throw new BadRequestException(
    late.length === 1
      ? `Step ${names} can't be due after the task's due date.`
      : `Steps ${names} can't be due after the task's due date.`,
  );
}