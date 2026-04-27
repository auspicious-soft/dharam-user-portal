export const isAuthenticated = (): boolean => {
  const hasLegacyFlag = localStorage.getItem("isLoggedIn") === "true";
  const hasAccessToken = Boolean(localStorage.getItem("authToken"));
  return hasLegacyFlag || hasAccessToken;
};

export const login = (): void => {
  localStorage.setItem("isLoggedIn", "true");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("authUpdated"));
  }
};

export const logout = (): void => {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("verificationToken");
  localStorage.removeItem("selectedCourseId");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("authUpdated"));
  }
};
