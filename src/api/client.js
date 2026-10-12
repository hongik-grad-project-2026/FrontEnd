// 모든 fetch 요청이 거쳐가는 공통 API client입니다.
// mock/실제 모드 선택, 헤더 구성, 응답 파싱과 공통 오류 변환을 담당합니다.

const mockMode = import.meta.env.VITE_USE_MOCK;

if (mockMode !== "true" && mockMode !== "false") {
  throw new Error("VITE_USE_MOCK은 true 또는 false로 설정해 주세요.");
}

const USE_MOCK = import.meta.env.DEV && mockMode === "true";

export const isMockMode = USE_MOCK;

function normalizeBaseUrl(value, environmentName) {
  const normalizedValue = value?.trim().replace(/\/+$/, "");

  if (!normalizedValue) {
    throw new Error(`${environmentName} 환경변수를 설정해 주세요.`);
  }

  return normalizedValue;
}

const BASE_URL = normalizeBaseUrl(
  USE_MOCK
    ? import.meta.env.VITE_MOCK_API_BASE_URL
    : import.meta.env.VITE_API_BASE_URL,
  USE_MOCK ? "VITE_MOCK_API_BASE_URL" : "VITE_API_BASE_URL",
);

const TOKEN_STORAGE_KEY = USE_MOCK
  ? "mulmi.mock.accessToken"
  : "mulmi.api.accessToken";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAccessToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function createRequestUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath}`;
}

function isJsonContentType(contentType) {
  return contentType.includes("application/json") || contentType.includes("+json");
}

async function parseResponseBody(response, responseType) {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  if (responseType === "blob") {
    const blob = await response.blob();
    return blob.size === 0 ? null : blob;
  }

  if (responseType === "text") {
    const text = await response.text();
    return text === "" ? null : text;
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (!isJsonContentType(contentType)) {
    const text = await response.text();

    if (text === "") {
      return null;
    }

    // HTTP 오류의 일반 텍스트 본문은 아래 공통 HTTP 오류 처리에서 메시지로 사용해.
    if (!response.ok) {
      return text;
    }

    // 일반 API 요청은 JSON 계약이야. HTML 같은 응답을 성공 데이터로 넘기지 않아.
    throw new ApiError({
      status: response.status,
      code: "UNEXPECTED_CONTENT_TYPE",
      message: "서버가 예상하지 않은 형식으로 응답했습니다.",
      data: text,
      response,
      errorType: "PARSE_ERROR",
    });
  }

  const text = await response.text();

  if (text === "") {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (cause) {
    throw new ApiError({
      status: response.status,
      code: "INVALID_JSON_RESPONSE",
      message: "서버 응답을 해석할 수 없습니다.",
      data: text,
      response,
      cause,
      errorType: "PARSE_ERROR",
    });
  }
}

export class ApiError extends Error {
  constructor({
    status,
    code = null,
    message = "요청에 실패했습니다.",
    errors = null,
    data = null,
    response = null,
    cause,
    errorType = "HTTP_ERROR",
    hasAuthToken = false,
  }) {
    super(message, cause ? { cause } : undefined);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
    this.data = data;
    this.response = response;
    this.errorType = errorType;
    this.isHttpError = errorType === "HTTP_ERROR";
    this.isBusinessError = errorType === "BUSINESS_ERROR";
    this.isNetworkError = errorType === "NETWORK_ERROR";
    this.isUnauthorized = status === 401;
    this.isSessionExpired = status === 401 && hasAuthToken;
  }
}

export async function request(
  path,
  {
    method = "GET",
    body,
    headers,
    responseType = "auto",
    auth = true,
    ...fetchOptions
  } = {},
) {
  const token = auth ? getAccessToken() : null;
  const requestHeaders = new Headers(headers);
  const hasBody = body !== undefined && body !== null;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (hasBody && !isFormData && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  // 인증 형식은 기존 동작을 유지합니다. Swagger에 security scheme이 없어 변경하지 않습니다.
  if (token && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(createRequestUrl(path), {
      ...fetchOptions,
      method,
      headers: requestHeaders,
      ...(hasBody && { body: isFormData ? body : JSON.stringify(body) }),
    });
  } catch (cause) {
    // 사용자가 취소했거나 AbortSignal이 중단한 요청은 호출한 쪽에서 구분할 수 있게 그대로 전달합니다.
    if (cause?.name === "AbortError") {
      throw cause;
    }

    // 브라우저 fetch는 CORS, 서버 단절, DNS 등의 네트워크 실패를 TypeError로 알립니다.
    if (cause instanceof TypeError) {
      throw new ApiError({
        status: null,
        code: "NETWORK_ERROR",
        message: "서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.",
        cause,
        errorType: "NETWORK_ERROR",
      });
    }

    throw cause;
  }

  const responseData = await parseResponseBody(response, responseType);

  const isEnvelope =
    responseData !== null &&
    typeof responseData === "object" &&
    !(responseData instanceof Blob) &&
    ("isSuccess" in responseData || "result" in responseData);

  const isBusinessFailure = isEnvelope && responseData.isSuccess === false;

  if (!response.ok || isBusinessFailure) {
    const errorData =
      responseData !== null &&
      typeof responseData === "object" &&
      !(responseData instanceof Blob)
        ? responseData
        : null;

    throw new ApiError({
      status: response.status,
      code: errorData?.code ?? null,
      message:
        errorData?.message ??
        (typeof responseData === "string" ? responseData : null) ??
        "요청에 실패했습니다.",
      errors: errorData?.result?.errors ?? errorData?.errors ?? null,
      data: responseData,
      response,
      errorType: response.ok ? "BUSINESS_ERROR" : "HTTP_ERROR",
      hasAuthToken: Boolean(token),
    });
  }

  return isEnvelope ? responseData.result ?? null : responseData;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
  del: (path, options) => request(path, { ...options, method: "DELETE" }),
};
