"use client";

import { type FormEvent, useRef, useState } from "react";
import { AlertCircle, ListPlus, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTask, useSaveTask } from "../../hooks/useTasks";
import {
  EMPTY_STEP_FIELDS,
  dateInputToIso,
  formFieldsToStepPayload,
  isoToDateInput,
  stepToFormFields,
} from "../../lib/utils";
import type { StepFormFields, Task } from "@/types/task";
import { DateInput } from "@/components/form/DateInput";
import { StepDialog } from "./StepDialog";

interface StepDraft extends StepFormFields {
  key: number;
  id?: number;
}

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

export function TaskFormDialog(props : TaskFormDialogProps) {

  const { open, onOpenChange, task } = props;
  const isEditing = Boolean(task);
  const nextStepKey = useRef(0);
  const [form, setForm] = useState({
    name: task?.name ?? "",
    description: task?.description ?? "",
    dueDate: isoToDateInput(task?.dueDate ?? null),
  });
  const [steps, setSteps] = useState<StepDraft[]>(() =>
    (task?.steps ?? []).map((step) => ({
      key: nextStepKey.current++,
      id: step.id,
      ...stepToFormFields(step),
    })),
  );
  const [showErrors, setShowErrors] = useState(false);
  const [stepDialog, setStepDialog] = useState({ open: false, editingKey: null as number | null, key: 0 });

  const create = useCreateTask();
  const update = useSaveTask();
  const submitting = create.submitting || update.submitting;
  const error = isEditing ? update.error : create.error;

  const nameMissing = !form.name.trim();
  const editingStep = steps.find((step) => step.key === stepDialog.editingKey) ?? null;

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      create.resetError();
      update.resetError();
    }
  }

  function openStepDialog(editingKey: number | null) {
    setStepDialog((current) => ({ open: true, editingKey, key: current.key + 1 }));
  }

  function saveStepDraft(fields: StepFormFields) {
    if (stepDialog.editingKey !== null) {
      setSteps((current) =>
        current.map((step) => (step.key === stepDialog.editingKey ? { ...step, ...fields } : step)),
      );
    } else {
      setSteps((current) => [...current, { key: nextStepKey.current++, ...fields }]);
    }
    setStepDialog((current) => ({ ...current, open: false }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nameMissing) {
      setShowErrors(true);
      return;
    }

    const details = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      dueDate: dateInputToIso(form.dueDate),
    };

    const saved = task
      ? await update.save({
          taskId: task.id,
          ...details,
          steps: steps.map((step) => ({ id: step.id, ...formFieldsToStepPayload(step) })),
        })
      : await create.save({ ...details, steps: steps.map(formFieldsToStepPayload) });

    if (saved) handleOpenChange(false);
  }

  const submitLabel = isEditing
    ? submitting ? "Saving…" : "Save changes"
    : submitting ? "Creating…" : "Create task";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-name">Name</Label>
              <Input
                id="task-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Renew car insurance"
                aria-invalid={showErrors && nameMissing}
                aria-describedby={showErrors && nameMissing ? "task-name-error" : undefined}
                autoFocus
              />
              {showErrors && nameMissing && (
                <p id="task-name-error" className="text-sm text-destructive">
                  Give the task a name.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">
                Description <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="task-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Anything worth remembering about this task"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due-date">
                Due date <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <DateInput
                id="task-due-date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full sm:w-48"
              />
            </div>
          </div>

          <section className="space-y-3" aria-labelledby="steps-heading">
            <div className="flex items-center justify-between">
              <div>
                <h3 id="steps-heading" className="text-sm font-medium">
                  Steps
                </h3>
                <p className="text-sm text-muted-foreground">
                  {steps.length === 0
                    ? "Optional smaller pieces of the task."
                    : `${steps.length} ${steps.length === 1 ? "step" : "steps"}`}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => openStepDialog(null)}>
                <ListPlus />
                Add step
              </Button>
            </div>

            {steps.length === 0 ? (
              <button
                type="button"
                onClick={() => openStepDialog(null)}
                className="w-full rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                No steps added yet.
              </button>
            ) : (
              <ol className="grid gap-2 sm:grid-cols-2">
                {steps.map((step, index) => (
                  <StepChip
                    key={step.key}
                    step={step}
                    index={index}
                    onEdit={() => openStepDialog(step.key)}
                    onRemove={() => setSteps((current) => current.filter((s) => s.key !== step.key))}
                  />
                ))}
              </ol>
            )}
          </section>

          {error && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>{isEditing ? "Couldn't save your changes" : "Couldn't create the task"}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={submitting} onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>

        <StepDialog
          key={stepDialog.key}
          open={stepDialog.open}
          onOpenChange={(next) => setStepDialog((current) => ({ ...current, open: next }))}
          title={editingStep ? "Edit step" : "New step"}
          submitLabel={editingStep ? "Done" : "Add step"}
          initial={editingStep ?? EMPTY_STEP_FIELDS}
          onSave={saveStepDraft}
        />
      </DialogContent>
    </Dialog>
  );
}

interface StepChipProps {
  step: StepDraft;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}

function StepChip(props: StepChipProps) {
    const { step, index, onEdit, onRemove } = props
  return (
    <li className="flex items-center gap-1 rounded-md border bg-muted/30 pl-3 transition-colors hover:bg-muted/60">
      <button
        type="button"
        onClick={onEdit}
        className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left text-sm focus-visible:outline-none"
        aria-label={`Edit step ${index + 1}: ${step.name}`}
      >
        <span className="text-xs tabular-nums text-muted-foreground">{index + 1}.</span>
        <span className="truncate font-medium">{step.name}</span>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
        aria-label={`Remove step ${index + 1}`}
      >
        <X />
      </Button>
    </li>
  );
}