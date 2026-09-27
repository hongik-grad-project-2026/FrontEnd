// mocks/handlers.js
import { http, HttpResponse, delay } from "msw";
import { users, toPublicUser, makeToken, parseToken } from "./db";

export const handlers = [

    // -- 로그인 --
    http.post("/api/login", async ({ request }) => {
        await delay(400); // 로딩 스피너·버튼 disabled 상태 확인 위한 의도적 지연

        const { id, password } = await request.json();

        // 400: 필드 자체가 비어서 온 경우
        if (!id || !password) {
            return HttpResponse.json(
                { message: "아이디와 비밀번호를 모두 입력해 주세요." },
                { status: 400 }
            );
        }

        const user = users.find(
            (u) => u.id === id && u.password === password
        );

        // 401: 이메일이 없는 건지 비번이 틀린 건지 구분해 주지 않음.
        if (!user) {
            return HttpResponse.json(
                { message: "이메일 또는 비밀번호를 확인해 주세요." },
                { status: 401 }
            );
        }

        // 200. client.js가 result를 반환하므로 응답도 API 엔벨로프를 따른다.
        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: {
                token: makeToken(user.id),
                user: toPublicUser(user),
            },
        });
    }),

    // -- 회원가입 --
    http.post("/api/users", async ({ request }) => {
        await delay(400);

        const body = await request.json();
        // const { name, id, email, password, tel, college, department } = await request.json();

        // 400: 필드별 결과를 errors 객체로 모음.
        const errors = {};
        if (!body.email?.includes("@")) errors.email = "올바른 이메일 형식이 아닙니다.";
        if (!body.password || (body.password.length < 8 && body.password.length > 16))
            errors.password = "비밀번호는 8자 이상 16자 이하여야 합니다.";
        if (!body.name) errors.name = "이름을 입력해 주세요.";
        if (!body.tel) errors.tel = "전화번호를 입력해 주세요.";
        if (!body.college) errors.college = "단과대학을 입력해 주세요.";
        if (!body.department) errors.department = "학과를 입력해 주세요.";

        if (Object.keys(errors).length > 0) {
            return HttpResponse.json(
                { message: "입력값을 확인해 주세요.", errors },
                { status: 400 }
            );
        }

        // 중복 id 409 재현 — 회원가입 에러 처리를 백엔드 없이 테스트 가능
        if (users.some((u) => u.id === body.id)) {
            return HttpResponse.json(
                { message: "이미 가입된 id입니다." },
                { status: 409 }
            );
        }

        const user = {
            id: users.length + 1,
            ...body,
            role: body.role ?? "student",
            profile_image_url: null
        };
        users.push(user); // 임시 저장소에 추가

        return HttpResponse.json(toPublicUser(user), { status: 201 });
    }),

    // -- 내정보 --
    http.get("/api/users/me", async ({ request }) => {
        await delay(200);

        // 헤더를 실제로 읽음 → client.js가 토큰을 제대로 붙이는지 검증됨
        const id = parseToken(request.headers.get("Authorization"));

        // 토큰이 없거나 형식이 깨진 경우
        if (!id) {
            return HttpResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
        }

        // 형식은 맞지만 그 id의 유저가 없는 경우 (새로고침으로 mock DB가 초기화된 뒤 등)
        const user = users.find((u) => u.id === id);
        if (!user) {
            return HttpResponse.json(
                { message: "유효하지 않은 토큰입니다." },
                { status: 401 }
            );
        }

        return HttpResponse.json(toPublicUser(user));
    }),
];