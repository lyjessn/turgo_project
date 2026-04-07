import { createContext, useEffect, useState } from "react";
import { SignIn, LogOut, GetUserData } from "../api/apiAuth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
        const data = await SignIn({ email, password });

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);
        setUser(data.user);
        setRole(data.role);

        return data;
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        throw error;
    }
 };

  const restoreSession = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setRole(null);
        return;
      }

      const data = await GetUserData();

      setUser(data.user);
      setRole(data.role);

    } catch (error) {
      console.error("RESTORE SESSION FAILED", error);
      localStorage.removeItem("token");
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
        await LogOut();
    } catch (e) {
        console.warn("Logout API failed");
    } finally {
        localStorage.removeItem("token");
        setUser(null);
        setRole(null);
    }
  };

  useEffect(() => {
    const savedRole = localStorage.getItem("role");

    if (savedRole) {
      setRole(savedRole);
    }

    restoreSession();
  }, []);

 return (
  <AuthContext.Provider
    value={{ user, setUser, role, setRole, login, logout, loading }}
  >
    {children}
  </AuthContext.Provider>
);
};
