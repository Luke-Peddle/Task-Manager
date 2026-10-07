"use client";

import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function DateInput({ className, onClick, ...props }: ComponentProps<typeof Input>) {
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