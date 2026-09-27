// be 연결 후 미사용될 파일


// 임시 계정 DB
export const users = [
    {
        id: "adminid",
        password: "12341234",
        name: "관리자",
        role: "admin",
        profile_image_url: null,
    },
    {
        id: "C111111",
        password: "12341234",
        name: "홍길동",
        role: "student",
        profile_image_url: 'https://media.licdn.com/dms/image/v2/C4D1BAQGT7ihga9VFvw/company-background_10000/company-background_10000/0/1618498738825/_cover?e=2147483647&v=beta&t=VAMjKXM8VeaRsYbJlMeoO09R0RN8FIOAKDjvjwff7QY'
        ,
    },
];

// MSW용 임시 문자열 토큰. 로그인 성공 시 사용자 ID를 붙여 mock-token-${id} 형식으로 만듦.
const TOKEN_PREFIX = "Bearer mock-token-";

export const makeToken = (id) => `mock-token-${id}`;

// 응답에서 비밀번호 제거 — 실제 서버도 절대 내려주지 않으므로 동작을 맞춤
// 구조 분해로 password만 빼내고 나머지를 새 객체로 모음
export const toPublicUser = ({ password, ...user }) => user;

export const parseToken = (header) => {
    if (!header?.startsWith(TOKEN_PREFIX)) return null;
    return header.slice(TOKEN_PREFIX.length) || null;
};