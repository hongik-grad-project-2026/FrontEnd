import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// TanStack Query 관련 import (무한스크롤)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// 라우터 관련 import
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { adminRoutes, commonRoutes } from "./routes/RoutesConfig.jsx";
import { UserProvider } from "./context/UserProvider.jsx";

const queryClient = new QueryClient(/*{
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 브라우저 탭/창 포커스 시 자동 재요청 비활성화 (기본 true)
      retry: 1,                    // API 요청 실패 시 재시도 횟수 (기본 3)
    },
  }
}*/);

const router = createBrowserRouter([
  // 공동 라우트
  commonRoutes,

  // 관리자모드 라우트
  adminRoutes,

  // 학생모드 라우트
  // 추가 예정
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <App /> */}
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
      <ReactQueryDevtools initialIsOpen={false} />{" "}
      {/*Devtools : 개발용 패널, 프로덕션 빌드 시 자동 비활성화됨 */}
    </QueryClientProvider>
  </StrictMode>,
);
