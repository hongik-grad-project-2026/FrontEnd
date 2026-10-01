import { useEffect, useRef, useState } from "react";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from "../api/authApi.js";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../api/client.js";
import { UserContext } from "./UserContext.jsx";

export const AUTH_STATUS = {
  CHECKING: "checking",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated",
  ERROR: "error",
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState(AUTH_STATUS.CHECKING);
  const [authError, setAuthError] = useState(null);
  const restoreRequestRef = useRef(null);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
      return undefined;
    }

    const controller = new AbortController();
    restoreRequestRef.current = controller;

    async function restoreSession() {
      try {
        const currentUser = await getCurrentUser({ signal: controller.signal });

        setUser(currentUser);
        setAuthError(null);
        setAuthStatus(AUTH_STATUS.AUTHENTICATED);
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }

        setUser(null);
        setAuthError(error);

        if (error?.isUnauthorized) {
          clearAccessToken();
          setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
          return;
        }

        if (error?.name === "AuthContractError") {
          clearAccessToken();
        }

        setAuthStatus(AUTH_STATUS.ERROR);
      } finally {
        if (restoreRequestRef.current === controller) {
          restoreRequestRef.current = null;
        }
      }
    }

    restoreSession();

    return () => {
      controller.abort();

      if (restoreRequestRef.current === controller) {
        restoreRequestRef.current = null;
      }
    };
  }, []);

  const isAuthenticated =
    authStatus === AUTH_STATUS.AUTHENTICATED && user !== null;

  async function login({ loginId, password }) {
    restoreRequestRef.current?.abort();
    setAuthError(null);

    const { accessToken, user: authenticatedUser } = await loginRequest(
      loginId,
      password,
    );

    // 응답 검증이 끝난 뒤에만 토큰과 사용자 상태를 저장해.
    setAccessToken(accessToken);
    setUser(authenticatedUser);
    setAuthStatus(AUTH_STATUS.AUTHENTICATED);

    return authenticatedUser;
  }

  async function logout() {
    restoreRequestRef.current?.abort();
    let serverError = null;

    try {
      if (getAccessToken()) {
        await logoutRequest();
      }
    } catch (error) {
      serverError = error;
    } finally {
      // 서버 로그아웃이 실패해도 이 브라우저의 로그인 정보는 반드시 지워.
      clearAccessToken();
      setUser(null);
      setAuthError(null);
      setAuthStatus(AUTH_STATUS.UNAUTHENTICATED);
    }

    return { serverError };
  }

  const value = {
    user,
    authStatus,
    authError,
    isAuthenticated,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
