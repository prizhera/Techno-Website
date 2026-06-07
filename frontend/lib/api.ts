const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed for ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function get<T = { data: unknown }>(path: string) {
  return request<T>(path);
}

export async function post<T = { data: unknown }>(path: string, body: unknown) {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function put<T = { data: unknown }>(path: string, body: unknown) {
  return request<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function del<T = { data: unknown }>(path: string) {
  return request<T>(path, { method: "DELETE" });
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

const api = { get, post, put, del };
export default api;
