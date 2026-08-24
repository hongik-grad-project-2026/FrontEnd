import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider, } from "@tanstack/react-query";

// 라우터 관련 import
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { adminRoutes, commonRoutes } from "./routes/RoutesConfig.jsx";
import { UserProvider } from "./context/UserProvider.jsx";

const router = createBrowserRouter([
  // 공동 라우트
  commonRoutes,

  // 관리자모드 라우트
  adminRoutes,

  // 학생모드 라우트
  // 추가 예정
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </QueryClientProvider>
  </StrictMode>,
);
