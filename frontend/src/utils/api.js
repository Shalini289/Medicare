const BASE_URL = "http://localhost:5000";

export const api = async (endpoint, optionsOrMethod = {}, body = null, tokenOverride = null) => {
  const legacyCall = typeof optionsOrMethod === "string";
  const token = tokenOverride || localStorage.getItem("token");
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

  const res = await fetch(`${BASE_URL}${endpoint}`, {
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
