import { dateInputToIso, isoToDateInput } from "@/lib/dates";
import type { Step, StepDraft, StepFormFields, Task, TaskFormFields } from "@/types/task";

export const EMPTY_STEP_FIELDS: StepFormFields = { name: "", description: "", dueDate: "" };

export function stepToFormFields(step: Step): StepFormFields {
  return {
    name: step.name,
    description: step.description ?? "",
    dueDate: isoToDateInput(step.dueDate),
  };
}

export function formFieldsToStepPayload(fields: StepFormFields) {
  return {
    name: fields.name.trim(),
    description: fields.description.trim() || null,
    dueDate: dateInputToIso(fields.dueDate),
  };
}

export function taskToFormFields(task?: Task | null): TaskFormFields {
  return {
    name: task?.name ?? "",
    description: task?.description ?? "",
    dueDate: isoToDateInput(task?.dueDate ?? null),
  };
}

export function formFieldsToTaskDetails(form: TaskFormFields) {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    dueDate: dateInputToIso(form.dueDate),
  };
}

export function draftsToStepPayloads(drafts: StepDraft[]) {
  return drafts.map((draft) => ({ id: draft.id, ...formFieldsToStepPayload(draft) }));
}

export function getLateStepKeys(drafts: StepDraft[], taskDueDate: string): Set<number> {
  if (!taskDueDate) return new Set();
  return new Set(
    drafts.filter((draft) => draft.dueDate && draft.dueDate > taskDueDate).map((draft) => draft.key),
  );
}