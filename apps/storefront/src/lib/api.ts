export class ApiError extends Error {
  constructor(
    message: string,
    public fields: Record<string, string[]> = {},
    public status = 0,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let csrf: string | null = null;
let sessionRequest: Promise<unknown> | null = null;

export async function api<T = Record<string, unknown>>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  if (!["GET", "HEAD"].includes(method) && !csrf) {
    sessionRequest ??= api("/session").finally(() => {
      sessionRequest = null;
    });
    await sessionRequest;
  }

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  if (csrf) headers.set("X-CSRF-TOKEN", csrf);

  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      method,
      credentials: "same-origin",
      cache: "no-store",
      signal: options.signal ?? AbortSignal.timeout(15000),
      headers,
    });
  } catch {
    throw new ApiError(
      "Unable to connect. Check your connection and try again.",
    );
  }

  if (response.status === 419) {
    csrf = null;
    throw new ApiError("Your session expired. Please try again.", {}, 419);
  }

  // A proxy or hosting error may return HTML with a 200 status. Never treat it
  // as a successful login, saved product or completed order.
  const data = await response.json().catch(() => null);
  if (!data || typeof data !== "object") {
    throw new ApiError(
      "The shop service returned an unexpected response. Please try again.",
      {},
      response.status,
    );
  }
  if (typeof data.csrf === "string") csrf = data.csrf;
  if (!response.ok) {
    const fields: Record<string, string[]> = {};
    if (data.errors && typeof data.errors === "object") {
      for (const [field, messages] of Object.entries(data.errors)) {
        if (Array.isArray(messages))
          fields[field] = messages.filter(
            (value): value is string => typeof value === "string",
          );
      }
    }
    throw new ApiError(
      Object.values(fields).flat().join(" ") ||
        (typeof data.message === "string"
          ? data.message
          : "Unable to complete this request. Please try again."),
      fields,
      response.status,
    );
  }
  return data as T;
}

export const json = (method: string, data: unknown): RequestInit => ({
  method,
  body: JSON.stringify(data),
});
