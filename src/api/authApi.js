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


// 임시 API : 회원가입
// 성공 시 생성된 user 객체 반환, 실패 시 에러를 throw
export async function signup({ name, id, password, email, tel, college, department, }) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 학번 중복 검사 — 실제 API에서는 서버가 처리할 몫
    const isDuplicated = MOCK_ACCOUNTS.some((item) => item.id === id);

    if (isDuplicated) {
        throw new Error("이미 가입된 학번입니다.");
    }

    const newAccount = {
        id,
        password,
        name,
        role: "student", // 회원가입으로 만들어지는 계정은 항상 학생
        profile_image_url: null,
        email,
        tel,
        college,
        department,
    };

    // 임시 저장 — 새로고침하면 사라짐. (메모리에만 존재)
    MOCK_ACCOUNTS.push(newAccount);

    const { password: _password, ...user } = newAccount;

    return user;
}