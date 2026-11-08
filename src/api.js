import { useEffect, useState } from "react";

export function useDebouncedValue(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });
  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new ApiError("The server returned an unreadable response.", response.status);
  }

  if (!response.ok) {
    throw new ApiError(payload.error ?? "The request could not be completed.", response.status, payload.fields);
  }

  return payload;
}

export function useApiData(path) {
  const [state, setState] = useState({ data: null, error: "", loading: true });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, loading: true, error: "" }));

    apiRequest(path, { signal: controller.signal })
      .then((data) => setState({ data, error: "", loading: false }))
      .catch((error) => {
        if (error.name !== "AbortError") {
          setState({ data: null, error: error.message, loading: false });
        }
      });

    return () => controller.abort();
  }, [path, attempt]);

  return { ...state, retry: () => setAttempt((value) => value + 1) };
}
