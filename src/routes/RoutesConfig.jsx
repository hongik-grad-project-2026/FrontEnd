// ------ 공용 ------
import { Navigate, Outlet } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import AuthLayout from '../components/layout/AuthLayout'
import NotFoundPage from '../pages/error/NotFoundPage'

// ------ 관리자모드 ------
// // 1차 페이지
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminRentalApprovalPage from '../pages/admin/AdminRentalApprovalPage'
import AdminRentalStatusPage from '../pages/admin/AdminRentalStatusPage'
import AdminRentalHistoryPage from '../pages/admin/AdminRentalHistoryPage'
import AdminEquipmentListPage from '../pages/admin/AdminEquipmentListPage'
import AdminMemberListPage from '../pages/admin/AdminMemberListPage'
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
    path: '/admin',
    element: <PageLayout />,
    handle: {
        title: "관리자모드",
    },
    children: [
        {
            index: true,
            // path: '/dashboard',
            element: <AdminDashboardPage />,
            handle: {
                title: "대시보드",
            },
        },
        {
            path: 'approval',
            element: <AdminRentalApprovalPage />,
            handle: {
                title: "대여신청 승인",
            }
        },
        {
            path: 'status',
            element: <AdminRentalStatusPage />,
            handle: {
                title: "대여현황",
            }
        },
        {
            path: 'equipment',
            element: <AdminEquipmentListPage />,
            handle: {
                title: "기자재 관리",
            }
        },
        {
            path: 'history',
            element: <AdminRentalHistoryPage />,
            handle: {
                title: "대여 기록",
            }
        },
        {
            path: 'members',
            element: <AdminMemberListPage />,
            handle: {
                title: "회원 관리",
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
                    element: <StudentNoticeListPage />,
                    loader: ({ params }) => fetchNoticeDetail(params.noticeId),
                    handle: {
                        title: ({ data }) => data?.title ?? "공지사항 상세",
                    },
                },

            ],
        },
    ]
};


export { commonRoutes, authRoutes, adminRoutes, studentRoutes }