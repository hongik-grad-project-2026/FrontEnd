import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// TanStack Query와 무한 스크롤 관련 모듈을 가져온다.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// 라우터 관련 모듈을 가져온다.
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  adminRoutes,
  studentRoutes,
  commonRoutes,
  authRoutes,
  notFoundRoute,
} from "./routes/RoutesConfig.jsx";
import { UserProvider } from "./context/UserProvider.jsx";

async function enableMocking() {
  const mockMode = import.meta.env.VITE_USE_MOCK;

  if (mockMode !== "true" && mockMode !== "false") {
    throw new Error("VITE_USE_MOCK은 true 또는 false로 설정해 주세요.");
  }

  if (!import.meta.env.DEV || mockMode === "false") return;

  const { startMockWorker } = await import("./mocks/browser");
  return startMockWorker();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 브라우저 탭이나 창에 포커스할 때의 자동 재요청을 비활성화함.
      retry: 1, // API 요청 실패 시 한 번 재시도함.
    },
  },
});

const router = createBrowserRouter([
  // 공통 라우트를 등록함.
  commonRoutes,

  // 인증 라우트를 등록함.
  authRoutes,

  // 관리자 모드 라우트를 등록함.
  adminRoutes,

  // 학생 모드 라우트를 등록함.
  studentRoutes,

  // 일치하는 경로가 없는 경우 마지막에 처리함.
  notFoundRoute,
]);
enableMocking().then(() => {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      {/* <App /> */}
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <RouterProvider router={router} />
        </UserProvider>
        <ReactQueryDevtools initialIsOpen={false} />{" "}
        {/* 개발용 패널이며 프로덕션 빌드에서는 비활성 상태임. */}
      </QueryClientProvider>
    </StrictMode>,
  );
});
