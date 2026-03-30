export const isAuthenticated = (): boolean => {
  const hasLegacyFlag = localStorage.getItem("isLoggedIn") === "true";
  const hasAccessToken = Boolean(localStorage.getItem("authToken"));
  return hasLegacyFlag || hasAccessToken;
};

export const login = (): void => {
  localStorage.setItem("isLoggedIn", "true");
};

export const logout = (): void => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("verificationToken");
};
