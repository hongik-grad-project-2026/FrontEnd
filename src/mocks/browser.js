// mocks/browser.js
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

const worker = setupWorker(...handlers);

export function startMockWorker() {
  return worker.start({
    // mock 모드의 업무 요청은 반드시 명시된 handler가 응답해야 합니다.
    // 처리되지 않은 요청을 실제 네트워크로 보내 mock/실제 데이터가 섞이는 것을 막습니다.
    onUnhandledRequest: "error",
  });
}
