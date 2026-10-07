"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskFormDialog } from "./dialogs/TaskFormDialog";

export function AddTask() {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  function openForm() {
    setFormKey((current) => current + 1);
    setOpen(true);
  }

  return (
    <>
      <Button onClick={openForm}>
        <Plus />
        Add task
      </Button>
      <TaskFormDialog key={formKey} open={open} onOpenChange={setOpen} />
    </>
  );
}