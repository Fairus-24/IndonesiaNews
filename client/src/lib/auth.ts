import { User } from "@/types";

const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUser(): User | null {
  const userData = localStorage.getItem(USER_KEY);
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function hasRole(role: string): boolean {
  const user = getUser();
  return user?.role === role;
}

export function hasAnyRole(roles: string[]): boolean {
  const user = getUser();
  return user ? roles.includes(user.role) : false;
}

export function isAdmin(): boolean {
  return hasAnyRole(["ADMIN", "DEVELOPER"]);
}

export function isDeveloper(): boolean {
  return hasRole("DEVELOPER");
}
