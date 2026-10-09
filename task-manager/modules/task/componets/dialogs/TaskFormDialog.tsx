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
import { cn } from "@/lib/utils";
import { useCreateTask, useSaveTask } from "../../hooks/useTasks";
import { EMPTY_STEP_FIELDS,
   draftsToStepPayloads,
   formFieldsToTaskDetails, 
   getLateStepKeys,
   stepToFormFields,
   taskToFormFields
  } from "../../lib/forms";
import type { Step, StepDraft, StepFormFields, Task } from "@/types/task";
import { DateInput } from "@/components/form/DateInput";
import { StepDialog } from "./StepDialog";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

export function TaskFormDialog({ open, onOpenChange, task }: TaskFormDialogProps) {
  const isEditing = Boolean(task);
  const [form, setForm] = useState(() => taskToFormFields(task));
  const [showErrors, setShowErrors] = useState(false);
  const steps = useStepDrafts(task?.steps ?? [], form.dueDate);

  const create = useCreateTask();
  const update = useSaveTask();
  const submitting = create.submitting || update.submitting;
  const error = isEditing ? update.error : create.error;

  const nameMissing = !form.name.trim();
  const hasLateSteps = steps.lateKeys.size > 0;

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      create.resetError();
      update.resetError();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nameMissing || hasLateSteps) {
      setShowErrors(true);
      return;
    }

    const details = formFieldsToTaskDetails(form);
    const stepPayloads = draftsToStepPayloads(steps.drafts);
    const saved = task
      ? await update.save({ taskId: task.id, ...details, steps: stepPayloads })
      : await create.save({ ...details, steps: stepPayloads });

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
                  {steps.drafts.length === 0
                    ? "Optional smaller pieces of the task."
                    : `${steps.drafts.length} ${steps.drafts.length === 1 ? "step" : "steps"}`}
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={steps.openNew}>
                <ListPlus />
                Add step
              </Button>
            </div>

            {steps.drafts.length === 0 ? (
              <button
                type="button"
                onClick={steps.openNew}
                className="w-full rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                No steps added yet.
              </button>
            ) : (
              <ol className="grid gap-2 sm:grid-cols-2">
                {steps.drafts.map((step, index) => (
                  <StepChip
                    key={step.key}
                    step={step}
                    index={index}
                    late={showErrors && steps.lateKeys.has(step.key)}
                    onEdit={() => steps.openEdit(step.key)}
                    onRemove={() => steps.remove(step.key)}
                  />
                ))}
              </ol>
            )}
            {showErrors && hasLateSteps && (
              <p role="alert" className="text-sm text-destructive">
                {steps.lateKeys.size === 1 ? "One step is" : `${steps.lateKeys.size} steps are`} due after
                the task. Move {steps.lateKeys.size === 1 ? "it" : "them"} earlier, or push the task&apos;s
                due date back.
              </p>
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
          key={steps.dialog.key}
          open={steps.dialog.open}
          onOpenChange={steps.setDialogOpen}
          title={steps.editing ? "Edit step" : "New step"}
          submitLabel={steps.editing ? "Done" : "Add step"}
          initial={steps.editing ?? EMPTY_STEP_FIELDS}
          onSave={steps.save}
          maxDate={form.dueDate || null}
        />
      </DialogContent>
    </Dialog>
  );
}

interface StepChipProps {
  step: StepDraft;
  index: number;
  late: boolean;
  onEdit: () => void;
  onRemove: () => void;
}

function StepChip({ step, index, late, onEdit, onRemove }: StepChipProps) {
  return (
    <li
      className={cn(
        "flex items-center gap-1 rounded-md border bg-muted/30 pl-3 transition-colors hover:bg-muted/60",
        late && "border-destructive bg-destructive/5",
      )}
    >
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

interface DialogState {
  open: boolean;
  editingKey: number | null;
  key: number;
}

function useStepDrafts(initialSteps: Step[], taskDueDate: string) {
  const nextKey = useRef(0);
  const [drafts, setDrafts] = useState<StepDraft[]>(() =>
    initialSteps.map((step) => ({ key: nextKey.current++, id: step.id, ...stepToFormFields(step) })),
  );
  const [dialog, setDialog] = useState<DialogState>({ open: false, editingKey: null, key: 0 });

  function open(editingKey: number | null) {
    setDialog((current) => ({ open: true, editingKey, key: current.key + 1 }));
  }

  function save(fields: StepFormFields) {
    if (dialog.editingKey !== null) {
      setDrafts((current) =>
        current.map((draft) => (draft.key === dialog.editingKey ? { ...draft, ...fields } : draft)),
      );
    } else {
      setDrafts((current) => [...current, { key: nextKey.current++, ...fields }]);
    }
    setDialog((current) => ({ ...current, open: false }));
  }

  return {
    drafts,
    editing: drafts.find((draft) => draft.key === dialog.editingKey) ?? null,
    lateKeys: getLateStepKeys(drafts, taskDueDate),
    dialog,
    openNew: () => open(null),
    openEdit: (key: number) => open(key),
    setDialogOpen: (next: boolean) => setDialog((current) => ({ ...current, open: next })),
    save,
    remove: (key: number) => setDrafts((current) => current.filter((draft) => draft.key !== key)),
  };
}