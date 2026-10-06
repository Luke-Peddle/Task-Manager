import { Result } from "@/types/Result";
import { httpClient } from "@/lib/httpClient/HTTPClient";
import { Step } from "@/types/task";

export interface UpdateStepPayload {
  stepId: number;
  completed: boolean;
}

export const updateStep = async (
  props: UpdateStepPayload
): Promise<Result<Step>> => {
  const { stepId, ...body } = props;
  return await httpClient.PATCH<Step>(`/tasks/steps/${stepId}`, JSON.stringify(body));
};