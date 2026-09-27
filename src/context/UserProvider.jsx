import { useState } from "react";
import { UserContext } from "./UserContext.jsx";
import { login as loginRequest } from "../api/authApi.js";


const USER_STORAGE_KEY = "user"; //localStorage에서 사용자 정보를 읽고 쓸 때 사용하는 키. 값은 사용자 객체를 JSON 문자열로 저장.
const TOKEN_STORAGE_KEY = "accessToken"; // API client가 Authorization 헤더에 넣기 위해 읽는 현재 토큰 키.



// 새로고침 시 사용자 정보와 토큰이 모두 유효한 저장값으로 있을 때만 로그인 상태를 복원
function getInitialUser() {
  // localStorage 원문입니다. storedUser는 아직 JSON 문자열이고, storedToken은 API 인증에 쓸 토큰 문자열입니다.
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

  // 사용자 정보나 토큰 중 하나라도 없으면 인증 세션이 완성되지 않은 상태입니다.
  // 오래되었거나 일부만 저장된 값은 지워서 보호 라우트가 잘못 로그인으로 판단하지 않게 합니다.
  if (!storedUser || !storedToken) {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }

  try {
    // 저장된 JSON 문자열을 앱에서 사용하는 사용자 객체로 변환합니다.
    const user = JSON.parse(storedUser);

    // 파싱에 성공해도 사용자 객체에 권한 판별에 필요한 role이 없으면 세션으로 인정하지 않습니다.
    if (!user || typeof user !== "object" || !user.role) {
      throw new Error("저장된 사용자 정보가 올바르지 않습니다.");
    }

    return user;
  } catch {
    // JSON이 손상됐거나 예상한 사용자 형태가 아니면 사용자·토큰을 함께 폐기합니다.
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return null;
  }
}

export function UserProvider({ children }) {
  // 현재 로그인 사용자입니다. 비로그인은 null, 로그인 상태는 서버에서 받은 사용자 객체로 나타냅니다.
  // getInitialUser를 함수로 전달해 초기 렌더 시에만 저장값을 읽는 lazy initialization을 사용합니다.
  const [user, setUser] = useState(getInitialUser);
  // 로그인 여부를 소비하는 컴포넌트가 매번 user의 null 여부를 직접 판단하지 않도록 제공하는 파생 boolean입니다.
  // user와 별도 state로 중복 저장하지 않아 두 값이 서로 달라지는 상태를 방지합니다.
  const isAuthenticated = user !== null;

  async function login({ id, password }) {
    // 서버 로그인 API 결과 중 토큰과 공개 사용자 정보를 분리합니다.
    const { token, user: userInfo } = await loginRequest(id, password);

    // API client도 `accessToken`을 읽으므로 저장 키를 일치시켜 모든 요청에 토큰이 포함되게 합니다.
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userInfo));
    setUser(userInfo);

    return userInfo; // 호출한 쪽에서 role로 이동 경로를 정할 수 있도록
  }

  function logout() {
    // 사용자 정보와 토큰을 함께 지워 로그아웃 후 인증 상태가 복원되지 않게 합니다.
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  }

  // Provider 하위에서 useUser()로 읽을 공개 API입니다.
  // user/isAuthenticated는 읽기 상태, login/logout은 인증 상태를 바꾸는 동작입니다.
  const value = { user, isAuthenticated, login, logout };

  // children은 앱의 라우터와 화면 트리이며, 이 트리 전체가 같은 사용자/인증 상태를 공유합니다.
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

