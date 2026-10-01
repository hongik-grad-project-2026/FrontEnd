import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

const ROLE_HOME = {
  admin: "/admin",
  student: "/student",
};

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, authStatus, isAuthenticated } = useUser();
  const location = useLocation();
  const requestedPath = `${location.pathname}${location.search}`;

  // 저장된 토큰을 확인하는 동안 로그인 화면으로 먼저 보내지 마.
  if (authStatus === "checking") {
    return null;
  }

  if (authStatus === "error") {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: requestedPath, authenticationFailed: true }}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: requestedPath }}
      />
    );
  }

  if (!ROLE_HOME[user?.role]) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }

  return children ?? <Outlet />;
}
