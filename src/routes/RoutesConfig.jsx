// ------ 공용 ------
import { Navigate, Outlet } from "react-router-dom";

import PageLayout from "../components/layout/PageLayout";
import AuthLayout from "../components/layout/AuthLayout";
import NotFoundPage from "../pages/error/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";

import { getAdminEquipmentModelSummary } from "../api/equipmentApi";

// ------ 관리자모드 ------
// 1차 페이지
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminEquipmentListPage from "../pages/admin/AdminEquipmentListPage";
import AdminMemberListPage from "../pages/admin/AdminMemberListPage";
import AdminRentalApprovalPage from "../pages/admin/AdminRentalApprovalPage";
import AdminRentalHistoryPage from "../pages/admin/AdminRentalHistoryPage";
import AdminRentalStatusPage from "../pages/admin/AdminRentalStatusPage";

// 2차 페이지
import AdminAssetListPage from "../pages/admin/AdminAssetListPage";
import AdminMemberDetailPage from "../pages/admin/AdminMemberDetailPage";
import AdminNoticeListPage from "../pages/admin/AdminNoticeListPage";
import AdminNoticeDetailPage from "../pages/admin/AdminNoticeDetailPage";
import AdminNoticeCreatePage from "../pages/admin/AdminNoticeCreatePage";
import AdminNoticeEditPage from "../pages/admin/AdminNoticeEditPage";

// ------ 학생모드 ------
// 1차 페이지
import StudentDashboardPage from "../pages/student/StudentDashboardPage";
import StudentEquipmentListPage from "../pages/student/StudentEquipmentListPage";
import StudentRentalHistoryPage from "../pages/student/StudentRentalHistoryPage";
import StudentMyPage from "../pages/student/StudentMyPage";

// 2차 페이지
import StudentNoticeListPage from "../pages/student/StudentNoticeListPage";
import StudentNoticeDetailPage from "../pages/student/StudentNoticeDetailPage";

// ------ 로그인/회원가입 ------
import LoginPage from "../pages/auth/LoginPage";
import SignUpPage from "../pages/auth/SignUpPage";
import SignUpCompletePage from "../pages/auth/SignUpCompletePage";

async function loadAdminEquipmentModel({ params }) {
  try {
    return await getAdminEquipmentModelSummary(params.modelId);
  } catch {
    return {
      modelId: params.modelId,
      name: "개별 기자재",
      labelPrefix: "",
    };
  }
}

// 공동 라우트
const commonRoutes = {
  path: "/",
  element: <Navigate to="/login" replace />,
};

const authRoutes = {
  element: <AuthLayout />,
  children: [
    {
      path: "/login",
      element: <LoginPage />,
      handle: {
        title: "로그인",
      },
    },
    {
      path: "/signup",
      element: <SignUpPage />,
      handle: {
        title: "회원가입",
      },
    },
    {
      path: "/signup/complete",
      element: <SignUpCompletePage />,
      handle: {
        title: "회원가입 완료",
      },
    },
  ],
};

// 관리자모드 라우트 그룹
const adminRoutes = {
  path: "/admin",
  // PageLayout을 보호 컴포넌트의 children으로 전달해 하위 페이지로 가기 전에 인증과 role을 검사
  element: (
    <ProtectedRoute allowedRoles={["admin"]}>
      <PageLayout />
    </ProtectedRoute>
  ),
  handle: {
    title: "관리자모드",
  },
  children: [
    {
      index: true,
      element: <AdminDashboardPage />,
      handle: {
        title: "대시보드",
      },
    },
    {
      path: "approval",
      element: <AdminRentalApprovalPage />,
      handle: {
        title: "대여신청 승인",
      },
    },
    {
      path: "status",
      element: <AdminRentalStatusPage />,
      handle: {
        title: "대여현황",
      },
    },
    {
      path: "equipment",
      element: <Outlet />,
      handle: {
        title: "기자재 관리",
      },
      children: [
        {
          index: true,
          element: <AdminEquipmentListPage />,
        },
        {
          path: ":modelId/assets",
          element: <AdminAssetListPage />,
          loader: loadAdminEquipmentModel,
          handle: {
            title: ({ data }) => data?.name ?? "개별 기자재",
          },
        },
      ],
    },
    {
      path: "history",
      element: <AdminRentalHistoryPage />,
      handle: {
        title: "대여 기록",
      },
    },
    {
      path: "members",
      element: <Outlet />,
      handle: {
        title: "회원 관리",
      },
      children: [
        {
          index: true,
          element: <AdminMemberListPage />,
        },
        {
          path: ":userId",
          element: <AdminMemberDetailPage />,
          handle: {
            title: "회원 상세",
          },
        },
      ],
    },
    {
      path: "notices",
      element: <Outlet />,
      handle: {
        title: "공지사항",
      },
      children: [
        {
          index: true,
          element: <AdminNoticeListPage />,
        },
        {
          path: ":noticeId",
          element: <AdminNoticeDetailPage />,
          handle: {
            title: "공지사항 상세",
          },
        },
        {
          path: "create",
          element: <AdminNoticeCreatePage />,
          handle: {
            title: "공지사항 작성",
          },
        },
        {
          path: "edit/:noticeId",
          element: <AdminNoticeEditPage />,
          handle: {
            title: "공지사항 수정",
          },
        },
      ],
    },
  ],
};

// 학생모드 라우트 그룹
const studentRoutes = {
  path: "/student",
  // 학생 영역의 허용 role을 student로 제한
  element: (
    <ProtectedRoute allowedRoles={["student"]}>
      <PageLayout />
    </ProtectedRoute>
  ),
  handle: {
    title: "학생모드",
  },
  children: [
    {
      index: true,
      element: <StudentDashboardPage />,
      handle: {
        title: "대시보드",
      },
    },
    {
      path: "equipment",
      element: <StudentEquipmentListPage />,
      handle: {
        title: "기자재 조회&신청",
      },
    },
    {
      path: "history",
      element: <StudentRentalHistoryPage />,
      handle: {
        title: "내 대여내역",
      },
    },
    {
      path: "mypage",
      element: <StudentMyPage />,
      handle: {
        title: "마이페이지",
      },
    },
    {
      path: "notices",
      element: <Outlet />,
      handle: {
        title: "공지사항",
      },
      children: [
        {
          index: true,
          element: <StudentNoticeListPage />,
        },
        {
          path: ":noticeId",
          element: <StudentNoticeDetailPage />,
          handle: {
            title: "공지사항 상세",
          },
        },
      ],
    },
  ],
};

const notFoundRoute = {
  path: "*",
  element: <NotFoundPage />,
};

export { commonRoutes, authRoutes, adminRoutes, studentRoutes, notFoundRoute };
