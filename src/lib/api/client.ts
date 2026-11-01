export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface Options {
  method?: "GET" | "POST" | "PATCH";
  token?: string | null;
  body?: unknown;
}

/** Typed fetch wrapper: adds the Bearer token, and turns Nest error bodies into ApiError. */
export async function api<T>(path: string, { method = "GET", token, body }: Options = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, {
      method,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Can’t reach the server. Check your connection and try again.");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const raw = data?.message;
    const message = Array.isArray(raw) ? raw.join(", ") : (raw ?? res.statusText);
    throw new ApiError(res.status, message);
  }
  return data as T;
}
