import { createContext, useContext } from "react";

export const UserContext = createContext(null); // null: 비로그인 또는 로딩 전

export function useUser() {
  return useContext(UserContext);
}
