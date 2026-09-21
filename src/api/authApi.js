// 임시 계정 목록 — 백엔드 연결 후 삭제
const MOCK_ACCOUNTS = [
    {
        id: "adminid",
        password: "1234",
        name: "관리자",
        role: "admin",
        profile_image_url: null,
    },
    {
        id: "C111111",
        password: "1234",
        name: "홍길동",
        role: "student",
        profile_image_url: 'https://media.licdn.com/dms/image/v2/C4D1BAQGT7ihga9VFvw/company-background_10000/company-background_10000/0/1618498738825/_cover?e=2147483647&v=beta&t=VAMjKXM8VeaRsYbJlMeoO09R0RN8FIOAKDjvjwff7QY'
        ,
    },
];

// 임시 API : 로그인
// 성공 시 user 객체 반환, 실패 시 에러를 throw
export async function login({ id, password }) {
    // 네트워크 지연 흉내 (로딩 UI 테스트용)
    await new Promise((resolve) => setTimeout(resolve, 300));

    const account = MOCK_ACCOUNTS.find(
        (item) => item.id === id && item.password === password,
    );

    if (!account) {
        throw new Error("학번 또는 비밀번호가 올바르지 않습니다.");
    }

    // 비밀번호는 응답에서 제외
    const { password: _password, ...user } = account;

    return user;
}