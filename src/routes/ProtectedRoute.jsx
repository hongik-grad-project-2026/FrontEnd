import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function ProtectedRoute({ allowedRoles, children }) {
    // user: 현재 사용자 데이터, isAuthenticated: Provider가 계산한 로그인 여부
    const { user, isAuthenticated } = useUser();
    // 로그인이 필요할 때 원래 요청한 경로를 보존해 로그인 이후 이동에 사용할 수 있도록
    const location = useLocation();

    // 비로그인 사용자가 가려던 경로는 state로 보존해 로그인 후 돌아갈 수 있게 함.
    if (!isAuthenticated) {
        return <Navigate
            to="/login" replace
            state={{ from: location.pathname }} />;
    }

    // 권한 부족 (student가 /admin 접근 등)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // 로그인 사용자는 자신의 역할 영역으로 보냄. 알 수 없는 role이면 로그인 화면으로.
        // roleHome: 현재 사용자가 접근할 수 있는 기본 경로
        const roleHome = user.role === "admin"
            ? "/admin"
            : user.role === "student"
                ? "/student"
                : "/login";

        return <Navigate to={roleHome} replace />;
    }

    // children은 명시적으로 감싼 화면(PageLayout 등)이고, 없으면 중첩 라우트의 자식 화면을 Outlet으로 표시
    return children ?? <Outlet />;
}