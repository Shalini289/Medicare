import { api } from "../utils/api";
import { setToken } from "../utils/auth";

export const login = async (data) => {
  const res = await api("/api/auth/login", "POST", data);
  if (res.token) setToken(res.token);
  return res;
};

export const verifyTwoFactorLogin = async (data) => {
  const res = await api("/api/auth/2fa/verify", "POST", data);
  setToken(res.token);
  return res;
};

export const getTwoFactorSettings = () =>
  api("/api/auth/2fa/settings");

export const updateTwoFactorSettings = (enabled) =>
  api("/api/auth/2fa/settings", "PUT", { enabled });

export const getProfile = () =>
  api("/api/auth/me");

export const updateProfile = (data) =>
  api("/api/auth/profile", "PUT", data);

export const changePassword = (data) =>
  api("/api/auth/password", "PUT", data);

export const register = async (data) => {
  return api("/api/auth/register", "POST", data);
};

export const forgotPassword = async (data) =>
  api("/api/auth/forgot-password", "POST", data);

export const resetPassword = async (token, data) =>
  api(`/api/auth/reset-password/${token}`, "POST", data);
