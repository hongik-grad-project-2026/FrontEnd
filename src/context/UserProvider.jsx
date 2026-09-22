import { useEffect, useState } from "react";
import { UserContext } from "./UserContext.jsx";

const MOCK_USER = {
  id: "C123456",
  name: "홍길동",
  // role: "admin",
  role: "student",
  profile_image_url: 'https://media.licdn.com/dms/image/v2/C4D1BAQGT7ihga9VFvw/company-background_10000/company-background_10000/0/1618498738825/_cover?e=2147483647&v=beta&t=VAMjKXM8VeaRsYbJlMeoO09R0RN8FIOAKDjvjwff7QY'
};

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    id: null,
    name: null,
    role: null,
    profile_image_url: null
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
