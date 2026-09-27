// 모든 fetch 요청이 거쳐가는 공통 API Client 함수
// 헤더 세팅, JSON 변환, 에러 처리 같은 반복 작업

// 백엔드 노션 기준
// 에러 판정 : res.ok + isSuccess
// 분기 기준 : code (200, 400 같은 숫자 문자열 대신 클라이언트가 분기할 수 있는 업무 오류 코드를 사용)
// 에러 메시지 : data.message
// 필드 에러 정보 : result.errors
// Ex) {
//   "isSuccess": true,
//   "code": "200",
//   "message": "성공",
//   "result": {}
// }

const BASE_URL = import.meta.env.VITE_API_BASE_URL;


// status를 담은 에러 객체.
// 페이지에서 각 에러코드들를 분기하려면 필요함
export class ApiError extends Error {
    constructor(status, data) {
        super(data?.message ?? "요청에 실패했습니다."); //"기본문구"

        this.name = "ApiError"; // Error와 구분 위함
        this.status = status; //catch에서 코드 분기 위함
        this.code = data?.code ?? null;    // 업무 오류 코드. 분기 기준
        this.errors = data?.result?.errors ?? null;  // 필드별 검증 오류
        this.data = data; // 원본 전체
    }
}


export async function request(
    path,
    { method = "GET", body, headers, ...options } = {}
) {
    //로컬스토리지에서 토큰 추출
    const token = localStorage.getItem("accessToken");

    // FormData는 브라우저가 boundary 포함 Content-Type을 자동 생성해야 하므로 직접 지정하면 안 됨
    const isFormData = body instanceof FormData;

    //API 요청 처리
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            ...(body && !isFormData && { "Content-Type": "application/json" }),
            ...(token && { Authorization: `Bearer ${token}` }),
            ...headers,
        },
        ...(body && { body: isFormData ? body : JSON.stringify(body) }),
        ...options,
    })

    // 응답 파싱
    const envelope = res.status === 204 ? null : await res.json().catch(() => null);


    // 판정을 두 겹으로. HTTP는 200인데 isSuccess가 false인 경우를 만날 수 있어서 둘 다 확인
    if (!res.ok || envelope?.isSuccess === false) {
        if (res.status === 401 && token) {
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
        }
        throw new ApiError(res.status, envelope);
    }

    // 벗겨서 result만 반환 -> 페이지는 엔벨로프를 모르도록
    return envelope?.result ?? null;
}


export const api = {
    get: (path, options) => request(path, { ...options, method: "GET" }),
    post: (path, body, options) => request(path, { ...options, method: "POST", body }),
    patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
    put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
    del: (path, options) => request(path, { ...options, method: "DELETE" }),
};