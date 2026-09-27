import { api } from "./client";

// 엔드포인트 문자열을 한 곳에 모아둠.
// 실제 요청은 MSW 핸들러가 가로챔 → 여기에 mock 로직을 두지 않음
export const login = (id, password) => api.post("/login", { id, password });
export const signup = (form) => api.post("/users", form); // form을 그대로 넘김 
export const me = () => api.get("/users/me"); // 토큰으로 현재 로그인한 사람을 조회. 새로고침 후 세션 복구에 씀
