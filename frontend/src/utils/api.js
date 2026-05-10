const getBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (apiUrl) return apiUrl;

  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  return null;
};

export const api = async (endpoint, optionsOrMethod = {}, body = null, tokenOverride = null) => {
  const legacyCall = typeof optionsOrMethod === "string";
  const token =
    tokenOverride ||
    (typeof window !== "undefined" ? localStorage.getItem("token") : null);
  const isFormData = body instanceof FormData || optionsOrMethod?.body instanceof FormData;
  const options = legacyCall
    ? {
        method: optionsOrMethod,
        body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      }
    : optionsOrMethod;

  const headers = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const baseUrl = getBaseUrl();

  if (!baseUrl) {
    throw new Error("Backend API URL is not configured. Set NEXT_PUBLIC_API_URL in Vercel.");
  }

  const res = await fetch(`${baseUrl}${endpoint}`, {
    cache: "no-store",
    ...options,
    headers,
  });

  let data = {};

  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.msg || "API Error");
  }

  return data;
};
