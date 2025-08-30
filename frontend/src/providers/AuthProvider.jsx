import { createContext, useEffect, useState } from "react";
import useAxiosPublic from "../hooks/useAxiosPublic";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const axiosPublic = useAxiosPublic();

  const logoutAndClear = () => {
    localStorage.removeItem("access-token");
    setUser(null);
  };

  // login user
  const signInUser = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axiosPublic.post("/auth/login", { email, password });
      localStorage.setItem("access-token", data.token);

      const meRes = await axiosPublic.get("/users/me", {
        headers: { Authorization: `Bearer ${data.token}` }
      });

      setUser(meRes.data);
      setLoading(false);
      return meRes.data;
    } catch (err) {
      setLoading(false);
      if (err.response?.status === 401) {
        logoutAndClear();
      }
      throw err.response?.data || { message: "Login failed" };
    }
  };

  // logout user manually
  const userLogout = logoutAndClear;

  // check if user already logged in
  useEffect(() => {
    const token = localStorage.getItem("access-token");
    if (token) {
      axiosPublic
        .get("/users/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => setUser(res.data))
        .catch((err) => {
          if (err.response?.status === 401) {
            logoutAndClear();
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [axiosPublic]);

  return (
    <AuthContext.Provider value={{ user, loading, signInUser, userLogout }}>
      {children}
    </AuthContext.Provider>
  );
}
