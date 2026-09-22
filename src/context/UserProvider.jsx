import { useState } from "react";
import { UserContext } from "./UserContext.jsx";
import { login as loginRequest } from "../api/authApi.js";


const EMPTY_USER = {
  id: null,
  name: null,
  role: null,
  profile_image_url: null,
};

const STORAGE_KEY = "user";

// 새로고침 시 저장된 로그인 정보 복원
function getInitialUser() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : EMPTY_USER;
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);

  async function login({ id, password }) {
    const userInfo = await loginRequest({ id, password });

    setUser(userInfo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userInfo));

    return userInfo; // 호출한 쪽에서 role로 이동 경로를 정할 수 있도록
  }

  function logout() {
    setUser(EMPTY_USER);
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = { user, setUser, login, logout };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

