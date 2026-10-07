import { toDate } from '../../common/utils.js';
import { CreateStepDto } from '../dto/create-step.dto.js';

export const STEP_ORDER = [
  { dueDate: { sort: 'asc' as const, nulls: 'last' as const } },
  { id: 'asc' as const },
];

export const stepData = (step: CreateStepDto) => ({
  name: step.name,
  description: step.description || null,
  dueDate: toDate(step.dueDate),
});