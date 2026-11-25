import { createContext, useContext } from "react";

// Context 기본값 null은 비로그인이 아닌 Provider 외부 사용 오류를 의미함.
// 실제 비로그인 상태에서는 Provider가 { user: null, isAuthenticated: false, ... }를 제공함.
export const UserContext = createContext(null);

export function useUser() {
  // 현재 컴포넌트에서 가장 가까운 UserProvider가 제공한 인증 컨텍스트 값임.
  const context = useContext(UserContext);

  if (context === null) {
    throw new Error("useUser는 UserProvider 내부에서 사용해야 합니다.");
  }

  return context;
}
