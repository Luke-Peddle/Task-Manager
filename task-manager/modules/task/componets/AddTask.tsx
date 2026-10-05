"use client";

import { type ComponentProps, type FormEvent, useRef, useState } from "react";
import { AlertCircle, ListPlus, Plus, X } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
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
import { useCreateTask } from "../hooks/useTasks";
import { dateInputToIso } from "../lib/utils";

interface StepDraft {
  key: number;
  name: string;
  description: string;
  dueDate: string;
}

type StepFields = Omit<StepDraft, "key">;

const EMPTY_FORM = { name: "", description: "", dueDate: "" };
const EMPTY_STEP: StepFields = { name: "", description: "", dueDate: "" };

export function AddTask() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [steps, setSteps] = useState<StepDraft[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<StepDraft | null>(null);
  const nextStepKey = useRef(0);
  const { createTask, submitting, error, resetError } = useCreateTask();

  const nameMissing = !form.name.trim();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setForm(EMPTY_FORM);
      setSteps([]);
      setShowErrors(false);
      resetError();
    }
  }

  function openNewStep() {
    setEditingStep(null);
    setStepDialogOpen(true);
  }

  function openEditStep(step: StepDraft) {
    setEditingStep(step);
    setStepDialogOpen(true);
  }

  function saveStep(fields: StepFields) {
    if (editingStep) {
      setSteps((current) =>
        current.map((step) => (step.key === editingStep.key ? { ...step, ...fields } : step)),
      );
    } else {
      setSteps((current) => [...current, { key: nextStepKey.current++, ...fields }]);
    }
    setStepDialogOpen(false);
  }

  function removeStep(key: number) {
    setSteps((current) => current.filter((step) => step.key !== key));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nameMissing) {
      setShowErrors(true);
      return;
    }

    const created = await createTask({
      name: form.name.trim(),
      description: form.description.trim() || null,
      dueDate: dateInputToIso(form.dueDate),
      steps: steps.map((step) => ({
        name: step.name.trim(),
        description: step.description.trim() || null,
        dueDate: dateInputToIso(step.dueDate),
      })),
    });

    if (created) handleOpenChange(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus />
        Add task
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
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
                <Button type="button" variant="outline" size="sm" onClick={openNewStep}>
                  <ListPlus />
                  Add step
                </Button>
              </div>

              {steps.length === 0 ? (
                <button
                  type="button"
                  onClick={openNewStep}
                  className="w-full rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  No steps added yet.
                </button>
              ) : (
                <ol className="grid gap-2 sm:grid-cols-2">
                  {steps.map((step, index) => (
                    <li
                      key={step.key}
                      className="flex items-center gap-1 rounded-md border bg-muted/30 pl-3 transition-colors hover:bg-muted/60"
                    >
                      <button
                        type="button"
                        onClick={() => openEditStep(step)}
                        className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left text-sm focus-visible:outline-none"
                        aria-label={`Edit step ${index + 1}: ${step.name}`}
                      >
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {index + 1}.
                        </span>
                        <span className="truncate font-medium">{step.name}</span>
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeStep(step.key)}
                        aria-label={`Remove step ${index + 1}`}
                      >
                        <X />
                      </Button>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertTitle>Couldn&apos;t create the task</AlertTitle>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating…" : "Create task"}
              </Button>
            </DialogFooter>
          </form>

          <StepDialog
            key={`${editingStep ? editingStep.key : "new"}-${stepDialogOpen}`}
            open={stepDialogOpen}
            initial={editingStep ?? EMPTY_STEP}
            isEditing={editingStep !== null}
            onOpenChange={setStepDialogOpen}
            onSave={saveStep}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

interface StepDialogProps {
  open: boolean;
  initial: StepFields;
  isEditing: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (fields: StepFields) => void;
}

function StepDialog({ open, initial, isEditing, onOpenChange, onSave }: StepDialogProps) {
  const [fields, setFields] = useState<StepFields>({
    name: initial.name,
    description: initial.description,
    dueDate: initial.dueDate,
  });
  const [showErrors, setShowErrors] = useState(false);
  const nameMissing = !fields.name.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (nameMissing) {
      setShowErrors(true);
      return;
    }
    onSave({ ...fields, name: fields.name.trim(), description: fields.description.trim() });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit step" : "New step"}</DialogTitle>
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
              onChange={(e) => setFields({ ...fields, dueDate: e.target.value })}
              className="w-full sm:w-48"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Save step" : "Add step"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DateInput({ className, onClick, ...props }: ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      type="date"
      className={cn("cursor-pointer", className)}
      onClick={(e) => {
        e.currentTarget.showPicker?.();
        onClick?.(e);
      }}
    />
  );
}