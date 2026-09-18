// ------ 공용 ------
import { Outlet } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
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


// 공동 라우트
const commonRoutes = {
    path: '/',
    element: <div>root TEST</div>,
    handle: {
        title: "root",
    }
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
    ]
};


export { commonRoutes, adminRoutes, studentRoutes }