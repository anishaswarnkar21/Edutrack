import { createContext, useContext, useEffect, useState, useCallback } from "react";
import config from "../config/config.js";
import { authService } from "../services/auth.service.js";
import { User } from "../models/User.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(config.authUserStorageKey);
    return raw ? new User(JSON.parse(raw)) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persist = useCallback((nextUser, token) => {
    localStorage.setItem(config.authTokenStorageKey, token);
    localStorage.setItem(config.authUserStorageKey, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        const { user: loggedInUser, token } = await authService.login({ email, password });
        persist(loggedInUser, token);
        return loggedInUser;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const register = useCallback(
    async ({ name, email, password, role }) => {
      setLoading(true);
      setError(null);
      try {
        const { user: newUser, token } = await authService.register({
          name,
          email,
          password,
          role,
        });
        persist(newUser, token);
        return newUser;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(config.authTokenStorageKey);
    localStorage.removeItem(config.authUserStorageKey);
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(config.authTokenStorageKey);
    if (!token || user) return;
    authService.me().then(setUser).catch(() => logout());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
