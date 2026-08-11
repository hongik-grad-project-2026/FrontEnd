import { useEffect, useState } from "react";
import { UserContext } from "./UserContext.jsx";

const MOCK_USER = {
  id: "C123456",
  name: "홍길동",
  role: "admin",
};

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    id: null,
    name: null,
    role: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const userInfo = await Promise.resolve(MOCK_USER);

      if (!cancelled) {
        setUser(userInfo);
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    console.log(user);
  }, [user]);

  const value = { user, setUser };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
