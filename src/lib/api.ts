export const API_BASE_URL = "http://localhost:3000";

export class ApiError extends Error {
  constructor(message: string, status?: number, body?: unknown) {
    super(message);
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const request = async <T>(path: string, init?: RequestInit) => {
  // ダミー遅延
  await sleep(1500);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new ApiError(`API error: ${res.status}`, res.status, body);
  }

  // json-server は 204 を返すこともあるので保険
  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
};

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

export const todoApi = {
  list: () => request<Todo[]>("/todos"),
  create: (title: string) =>
    request<Todo>("/todos", {
      method: "POST",
      body: JSON.stringify({
        title,
        completed: false,
        createdAt: new Date().toISOString(),
      }),
    }),
  update: (id: number, patch: Partial<Pick<Todo, "title" | "completed">>) =>
    request<Todo>(`/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  remove: (id: number) => request<void>(`/todos/${id}`, { method: "DELETE" }),
};
