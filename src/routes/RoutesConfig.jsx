// ------ 공용 ------
import { Navigate, Outlet } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import AuthLayout from '../components/layout/AuthLayout'
import NotFoundPage from '../pages/error/NotFoundPage'
import { Outlet } from "react-router-dom";

import { getAdminEquipmentModelSummary } from "../api/equipmentApi";
import { getAdminMemberSummary } from "../api/memberApi";
import { fetchNoticeDetail } from "../api/noticeApi";

import PageLayout from "../components/layout/PageLayout";
import NotFoundPage from "../pages/error/NotFoundPage";

// ------ 관리자모드 ------
// // 1차 페이지
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminEquipmentListPage from "../pages/admin/AdminEquipmentListPage";
import AdminMemberListPage from "../pages/admin/AdminMemberListPage";
import AdminRentalApprovalPage from "../pages/admin/AdminRentalApprovalPage";
import AdminRentalHistoryPage from "../pages/admin/AdminRentalHistoryPage";
import AdminRentalStatusPage from "../pages/admin/AdminRentalStatusPage";

// // 2차 페이지
import AdminAssetListPage from '../pages/admin/AdminAssetListPage'
import AdminNoticeListPage from '../pages/admin/AdminNoticeListPage'
import AdminNoticeDetailPage from '../pages/admin/AdminNoticeDetailPage'
import { fetchNoticeDetail } from '../api/noticeApi'
import AdminNoticeCreatePage from '../pages/admin/AdminNoticeCreatePage'
import AdminNoticeEditPage from '../pages/admin/AdminNoticeEditPage'

// ------ 학생모드 ------
// // 1차 페이지
import StudentDashboardPage from '../pages/student/StudentDashboardPage'
import StudentEquipmentListPage from '../pages/student/StudentEquipmentListPage'
import StudentRentalHistoryPage from '../pages/student/StudentRentalHistoryPage'
import StudentMyPage from '../pages/student/StudentMyPage'
// // 2차 페이지
import StudentNoticeListPage from '../pages/student/StudentNoticeListPage'
import StudentNoticeDetailPage from '../pages/student/StudentNoticeDetailPage'
import AdminAssetListPage from "../pages/admin/AdminAssetListPage";
import AdminMemberDetailPage from "../pages/admin/AdminMemberDetailPage";
import AdminNoticeDetailPage from "../pages/admin/AdminNoticeDetailPage";
import AdminNoticeListPage from "../pages/admin/AdminNoticeListPage";

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

async function loadAdminMemberSummary({ params }) {
  try {
    return await getAdminMemberSummary(params.memberId);
  } catch {
    return {
      id: params.memberId,
      name: "회원 상세",
    };
  }
}

// ------ 로그인/회원가입 ------
import LoginPage from '../pages/auth/LoginPage'
import SignUpPage from '../pages/auth/SignUpPage'
import SignUpCompletePage from '../pages/auth/SignUpCompletePage'

// 공동 라우트
const commonRoutes = {
    path: '/',
    element: <Navigate to="/login" replace />,
};

const authRoutes = {
    element: <AuthLayout />,
    children: [
        {
            path: '/login',
            element: <LoginPage />,
            handle: {
                title: "로그인",
            },
        },
        {
            path: '/signup',
            element: <SignUpPage />,
            handle: {
                title: "회원가입",
            },
        },
        {
            path: '/signup/complete',
            element: <SignUpCompletePage />,
            handle: {
                title: "회원가입 완료",
            },
        },
    ]
};

// 관리자모드 라우트 그룹
const adminRoutes = {
  path: "/admin",
  element: <PageLayout />,
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
          path: ":memberId",
          element: <AdminMemberDetailPage />,
          loader: loadAdminMemberSummary,
          handle: {
            title: ({ data }) => data?.name ?? "회원 상세",
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
            path: 'notices',
            element: <Outlet />,
            handle: {
                title: "공지사항",
            },
            children: [
                {
                    index: true,
                    element: <AdminNoticeListPage />,
                    // handle: {
                    //     title: "공지사항",
                    // },
                },
                {
                    path: ':noticeId',
                    element: <AdminNoticeDetailPage />,
                    loader: ({ params }) => fetchNoticeDetail(params.noticeId),
                    handle: {
                        title: ({ data }) => data?.title ?? "공지사항 상세",
                    },
                },
                {
                    path: 'create',
                    element: <AdminNoticeCreatePage />,
                    handle: {
                        title: "공지사항 작성",
                    },
                },
                {
                    path: 'edit/:noticeId',
                    element: <AdminNoticeEditPage />,
                    loader: ({ params }) => fetchNoticeDetail(params.noticeId),
                    handle: {
                        title: "공지사항 수정",
                    },
                },
            ],
        },
    ]
};


// 학생모드 라우트 그룹
const studentRoutes = {
    path: '/student',
    element: <PageLayout />,
    handle: {
        title: "학생모드",
    },
    children: [
        {
            index: true,
            // path: '/dashboard',
            element: <StudentDashboardPage />,
            handle: {
                title: "대시보드",
            },
        },
        {
            path: 'equipment',
            element: <StudentEquipmentListPage />,
            handle: {
                title: "기자재 조회&신청",
            }
        },
        {
            path: 'history',
            element: <StudentRentalHistoryPage />,
            handle: {
                title: "내 대여내역",
            }
        },
        {
            path: 'mypage',
            element: <StudentMyPage />,
            handle: {
                title: "마이페이지",
            }
        },
        {
            path: 'notices',
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
                    path: ':noticeId',
                    element: <StudentNoticeDetailPage />,
                    loader: ({ params }) => fetchNoticeDetail(params.noticeId),
                    handle: {
                        title: ({ data }) => data?.title ?? "공지사항 상세",
                    },
                },

            ],
        },
      ],
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ],
};


export { commonRoutes, authRoutes, adminRoutes, studentRoutes }
