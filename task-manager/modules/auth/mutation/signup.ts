import { Result } from "@/types/Result";
import { httpClient } from "@/lib/httpClient/HTTPClient";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export const signup = async (props: SignupPayload): Promise<Result<User>> => {
  return await httpClient.POST<User>("/auth/signup", JSON.stringify(props));
};