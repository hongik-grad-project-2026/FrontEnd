import { createContext, useContext } from "react";

// Context 기본값 null은 비로그인 상태가 아니라 Provider 밖에서 사용된 상황을 뜻함 : 에러 상황
// 실제 비로그인은 Provider가 { user: null, isAuthenticated: false, ... }를 제공
export const UserContext = createContext(null);

export function useUser() {
  // 현재 컴포넌트에서 가장 가까운 UserProvider가 제공한 인증 컨텍스트 값입니다.
  const context = useContext(UserContext);

  if (context === null) {
    throw new Error("useUser는 UserProvider 내부에서 사용해야 합니다.");
  }

  return context;
}
