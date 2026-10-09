"use client";

import { type FormEvent, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignup } from "../hooks/useAuth";

const MIN_PASSWORD = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignupForm() {
  const { submit, submitting, user, error } = useSignup();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showErrors, setShowErrors] = useState(false);

  const errors = {
    name: !form.name.trim() ? "Enter your name." : null,
    email: !EMAIL_PATTERN.test(form.email.trim()) ? "Enter a valid email address." : null,
    password:
      form.password.length < MIN_PASSWORD ? `Use at least ${MIN_PASSWORD} characters.` : null,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    submit({ name: form.name.trim(), email: form.email.trim(), password: form.password });
  }

  if (user) {
    return (
      <div className="space-y-4 text-center">
        <p>
            signed up successfully
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">Start keeping track of your tasks.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="signup-name">Name</Label>
          <Input
            id="signup-name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            aria-invalid={showErrors && Boolean(errors.name)}
            aria-describedby={showErrors && errors.name ? "signup-name-error" : undefined}
            autoFocus
          />
          {showErrors && errors.name && (
            <p id="signup-name-error" className="text-sm text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            aria-invalid={showErrors && Boolean(errors.email)}
            aria-describedby={showErrors && errors.email ? "signup-email-error" : undefined}
          />
          {showErrors && errors.email && (
            <p id="signup-email-error" className="text-sm text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            aria-invalid={showErrors && Boolean(errors.password)}
            aria-describedby="signup-password-hint"
          />
          <p
            id="signup-password-hint"
            className={
              showErrors && errors.password ? "text-sm text-destructive" : "text-sm text-muted-foreground"
            }
          >
            At least {MIN_PASSWORD} characters.
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}