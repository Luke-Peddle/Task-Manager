"use client";

import { type FormEvent, useState } from "react";
import { DateInput } from "@/components/form/DateInput";
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
import { useSaveStep } from "../../hooks/useTasks";
import { EMPTY_STEP_FIELDS } from "../../lib/forms";
import {dateInputToIso, formatShortDate, isoToDateInput} from "@/lib/dates";
import { formFieldsToStepPayload, stepToFormFields } from "../../lib/forms";
import type { Step, StepFormFields } from "@/types/task";

interface StepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  submitLabel: string;
  initial: StepFormFields;
  onSave: (fields: StepFormFields) => void;
  saving?: boolean;
  error?: string | null;
  maxDate?: string | null;
}

export function StepDialog(props: StepDialogProps) {
  const { open, onOpenChange, title, submitLabel, initial, onSave, saving, error, maxDate } = props;
  const [fields, setFields] = useState<StepFormFields>(initial);
  const [showErrors, setShowErrors] = useState(false);
  const nameMissing = !fields.name.trim();
  const tooLate = Boolean(maxDate && fields.dueDate && fields.dueDate > maxDate);
  const taskDueLabel = maxDate ? formatShortDate(dateInputToIso(maxDate)!) : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (nameMissing || tooLate) {
      setShowErrors(true);
      return;
    }
    onSave(fields);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="step-name">Name</Label>
            <Input
              id="step-name"
              value={fields.name}
              onChange={(e) => setFields({ ...fields, name: e.target.value })}
              placeholder="Get three quotes"
              aria-invalid={showErrors && nameMissing}
              aria-describedby={showErrors && nameMissing ? "step-name-error" : undefined}
              autoFocus
            />
            {showErrors && nameMissing && (
              <p id="step-name-error" className="text-sm text-destructive">
                Give the step a name.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="step-description">
              Description <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="step-description"
              value={fields.description}
              onChange={(e) => setFields({ ...fields, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="step-due-date">
              Due date <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <DateInput
              id="step-due-date"
              value={fields.dueDate}
              max={maxDate ?? undefined}
              onChange={(e) => setFields({ ...fields, dueDate: e.target.value })}
              aria-invalid={showErrors && tooLate}
              aria-describedby="step-due-date-hint"
              className="w-full sm:w-48"
            />
            {taskDueLabel && (
              <p
                id="step-due-date-hint"
                className={showErrors && tooLate ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
              >
                {showErrors && tooLate
                  ? `Pick a date on or before ${taskDueLabel}, when the task is due.`
                  : `The task is due ${taskDueLabel}.`}
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step: Step | null;
  taskDueDate: string | null;
}

export function EditStepDialog({ open, onOpenChange, step, taskDueDate }: EditStepDialogProps) {
  const { save, submitting, error, resetError } = useSaveStep();

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) resetError();
  }

  async function handleSave(fields: StepFormFields) {
    if (!step) return;
    const saved = await save({ stepId: step.id, ...formFieldsToStepPayload(fields) });
    if (saved) handleOpenChange(false);
  }

  return (
    <StepDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Edit step"
      submitLabel={submitting ? "Saving…" : "Save step"}
      initial={step ? stepToFormFields(step) : EMPTY_STEP_FIELDS}
      onSave={handleSave}
      saving={submitting}
      error={error}
      maxDate={isoToDateInput(taskDueDate)}
    />
  );
}