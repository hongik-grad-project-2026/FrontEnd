// 브라우저용 MSW 설정 파일임.
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

const worker = setupWorker(...handlers);

export function startMockWorker() {
  return worker.start({
    // mock 모드의 업무 요청은 반드시 명시된 handler가 응답해야 함.
    // 처리되지 않은 요청의 실제 네트워크 전송을 차단해 mock과 실제 데이터의 혼합을 방지함.
    onUnhandledRequest: "error",
  });
}
