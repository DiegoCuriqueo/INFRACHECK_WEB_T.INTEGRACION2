import { createContext, useContext, useState } from "react";
const UserCtx = createContext(null);
export const useUser = () => useContext(UserCtx);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // llena desde login o API
  return <UserCtx.Provider value={{ user, setUser }}>{children}</UserCtx.Provider>;
}
