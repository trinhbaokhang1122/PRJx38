  import { createContext, useState, useEffect } from "react";
  import axiosClient from "../api/axiosClient";

  export const AuthContext = createContext();

  export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (savedUser) {
        return JSON.parse(savedUser);
      } else if (token) {
        return { token };
      }
      return null;
    });

    useEffect(() => {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    }, [user]);

    const login = async (email, password) => {
      const { data } = await axiosClient.post("/users/login", { email, password });

      const fullUser = {
        ...data.user,
        token: data.token,
        isAdmin: data.user.isAdmin || data.user.role === "admin" || false,
      };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(fullUser));
      setUser(fullUser);
    };

    const register = async (name, email, password) => {
      const { data } = await axiosClient.post("/users/register", { name, email, password });
      const fullUser = {
        ...data.user,
        token: data.token,
        isAdmin: data.user.isAdmin || data.user.role === "admin" || false,
      };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(fullUser));
      setUser(fullUser);
    };

    const logout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    };

    return (
      <AuthContext.Provider value={{ user, login, register, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };
