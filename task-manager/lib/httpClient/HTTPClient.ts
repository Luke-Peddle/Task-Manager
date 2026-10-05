import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosError,
} from "axios";
import type { HttpError, Result } from "@/types/Result";

const AXIOS_TIMEOUT_MILLISECONDS = 10 * 60 * 1000;

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: AXIOS_TIMEOUT_MILLISECONDS,
});

const handleRequest = async <T>(
  request: Promise<any>
): Promise<Result<T, HttpError>> => {
  try {
    const res = await request;
    return { data: res.data as T, error: null };
  } catch (err) {
    const error = err as AxiosError<any>;
    const status = error.response?.status ?? 500;
    const rawMessage = error.response?.data?.message;
    const message =
      (Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage) ||
      (error.response ? (status >= 500 ? "Server error" : "Unhandled error occurred") : "Couldn't reach the server");

    return { data: null, error: { message, statusCode: status } };
  }
};

interface BaseOptions {
  headers?: Record<string, string>;
}

interface GetOptions extends BaseOptions {
  cache?: RequestCache;
}

const GET = async <T>(
  url: string,
  options?: GetOptions
): Promise<Result<T>> => {
  return handleRequest<T>(
    axiosInstance.get(url, {
      headers: options?.headers,
      ...(options || {}),
    } as AxiosRequestConfig)
  );
};

const createRequestConfig = (
  body?: any,
  options?: BaseOptions
): AxiosRequestConfig => {
  const config = { ...(options || {}) } as AxiosRequestConfig;
  const headers: Record<string, any> = { ...(config.headers ?? {}) };

  if (body instanceof FormData) {
    headers["Content-Type"] = null;
  }

  config.headers = headers;
  return config;
};

const POST = async <T>(
  url: string,
  body?: any,
  options?: BaseOptions
): Promise<Result<T, HttpError>> =>
  handleRequest<T>(
    axiosInstance.post(url, body, createRequestConfig(body, options))
  );

const PATCH = async <T>(
  url: string,
  body?: any,
  options?: BaseOptions
): Promise<Result<T, HttpError>> =>
  handleRequest<T>(
    axiosInstance.patch(url, body, createRequestConfig(body, options))
  );

const PUT = async <T>(
  url: string,
  body?: any,
  options?: BaseOptions
): Promise<Result<T, HttpError>> =>
  handleRequest<T>(
    axiosInstance.put(url, body, createRequestConfig(body, options))
  );

const DELETE = async <T>(
  url: string,
  options?: BaseOptions
): Promise<Result<T, HttpError>> => {
  return handleRequest<T>(
    axiosInstance.delete(url, {
      headers: options?.headers,
      ...(options || {}),
    } as AxiosRequestConfig)
  );
};

export const httpClient = {
  GET,
  POST,
  DELETE,
  PATCH,
  PUT,
};