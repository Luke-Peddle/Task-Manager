import { useMutation } from "@tanstack/react-query";
import { signup, type SignupPayload } from "../mutation/signup";

export function useSignup() {
  const mutation = useMutation({
    mutationFn: (payload: SignupPayload) => signup(payload),
  });

  const result = mutation.data;

  return {
    submit: (payload: SignupPayload) => mutation.mutate(payload),
    submitting: mutation.isPending,
    user: result && result.error === null ? result.data : null,
    error: result?.error?.message ?? null,
  };
}