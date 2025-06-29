import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthResponse } from "@/types";
import { getToken, setToken, removeToken, getUser, setUser } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      const userData = getUser();

      if (token && userData) {
        try {
          // Verify token is still valid
          const response = await apiRequest("GET", "/api/auth/me");
          const data = await response.json();
          setUserState(data.user);
        } catch (error) {
          // Token is invalid, clear auth data
          removeToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const data: AuthResponse = await response.json();
      
      setToken(data.token);
      setUser(data.user);
      setUserState(data.user);
      
      toast({
        title: "Login Berhasil",
        description: `Selamat datang, ${data.user.fullName}!`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login gagal";
      toast({
        title: "Login Gagal",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await apiRequest("POST", "/api/auth/register", data);
      const result: AuthResponse = await response.json();
      
      setToken(result.token);
      setUser(result.user);
      setUserState(result.user);
      
      toast({
        title: "Registrasi Berhasil",
        description: `Selamat datang, ${result.user.fullName}!`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registrasi gagal";
      toast({
        title: "Registrasi Gagal",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    setUserState(null);
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari akun",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
