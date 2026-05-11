export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
};

export const setToken = (token) => {
  localStorage.setItem("token", token);
  window.dispatchEvent(new Event("authchange"));
};

export const getCurrentUser = () => {
  if (typeof window === "undefined") return null;

  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("authchange"));
  window.location.href = "/login";
};
