export const isAuthenticated = (): boolean => {
  return localStorage.getItem("isLoggedIn") === "true";
};

export const login = (): void => {
  localStorage.setItem("isLoggedIn", "true");
};

export const logout = (): void => {
  localStorage.removeItem("isLoggedIn");
};
