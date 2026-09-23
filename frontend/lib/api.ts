import { LinkAnalytics, URLCreatePayload, URLItem } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new ApiError(
      "Unable to connect to TLG LINK backend server. Please verify the backend service is running.",
      0
    );
  }

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (typeof errorJson.detail === "string") {
        errorDetail = errorJson.detail;
      } else if (Array.isArray(errorJson.detail)) {
        errorDetail = errorJson.detail.map((d: { msg?: string }) => d.msg).join(", ");
      }
    } catch {
      // Use fallback
    }
    throw new ApiError(errorDetail, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  createUrl: (payload: URLCreatePayload): Promise<URLItem> => {
    return request<URLItem>("/api/v1/urls", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getLinkAnalytics: (token: string): Promise<LinkAnalytics> => {
    return request<LinkAnalytics>(`/api/v1/analytics/${token}`, {
      cache: "no-store",
    });
  },

  deleteLinkByToken: (token: string): Promise<{ message: string }> => {
    return request<{ message: string }>(`/api/v1/analytics/${token}`, {
      method: "DELETE",
    });
  },
};
