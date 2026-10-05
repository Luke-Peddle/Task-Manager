interface Error {
  message: string;
}

export interface HttpError extends Error {
  statusCode: number;
}

export type Result<T, E = HttpError> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: E;
    };