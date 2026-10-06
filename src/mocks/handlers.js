// mocks/handlers.js
// 요청을 개발 환경에서 가로채는 mock 서버 설정
// 실제 백엔드 연결 전에도 필터링과 page/size 응답을 화면에서 시험할 수 있도록 mock 서버 역할

import { http, HttpResponse, delay } from "msw";
import {
    // auth
    users, makeToken, parseToken,

    // equipment
    equipmentModels,
} from "./db";
import { MOCK_MEMBERS } from "../api/memberApi";
import { MOCK_EQUIPMENT_CATEGORIES } from "../api/categories";
import {
    getNextMockAttachmentId,
    getNextMockNoticeId,
    mockNotices,
} from "./noticeData";

const MOCK_API_BASE_URL = import.meta.env.VITE_MOCK_API_BASE_URL?.trim().replace(/\/+$/, "");

if (!MOCK_API_BASE_URL) {
    throw new Error("VITE_MOCK_API_BASE_URL 환경변수를 설정해 주세요.");
}

const mockApiUrl = (path) => `${MOCK_API_BASE_URL}${path}`;

function getMockMemberStatus(member) {
    if (member.listGroup === "blacklist") {
        return "SUSPENDED";
    }

    return "ACTIVE";
}

function toMockMemberResponse(member) {
    return {
        userId: member.id,
        loginId: member.studentId,
        name: member.name,
        studentId: member.studentId,
        email: member.email,
        phoneNumber: member.phone,
        college: member.college ?? "공과대학",
        department: member.department,
        profileImageUrl: null,
        status: getMockMemberStatus(member),
        createdAt: "2026-03-01T09:00:00",
        updatedAt: "2026-03-01T09:00:00",
    };
}

function toMockMyInfoResponse(user) {
    return {
        userId: user.userId ?? user.id,
        loginId: user.id,
        name: user.name,
        studentId: user.studentId ?? user.id,
        email: user.email ?? "",
        phoneNumber: user.phoneNumber ?? "",
        college: user.college ?? "",
        department: user.department ?? "",
        profileImageUrl: user.profile_image_url ?? null,
        role: user.role === "admin" ? "ASSISTANT" : "STUDENT",
        status: user.status ?? "ACTIVE",
    };
}

function toMockNoticeSummary(notice) {
    return {
        noticeId: notice.noticeId,
        title: notice.title,
        important: notice.important,
        authorId: notice.authorId,
        authorName: notice.authorName,
        createdAt: notice.createdAt,
    };
}

function getMockNoticeValidationErrors(body) {
    const errors = {};

    if (typeof body.title !== "string" || body.title.length > 200) {
        errors.title = "제목은 200자 이하로 입력해 주세요.";
    }

    if (typeof body.content !== "string" || body.content.trim() === "") {
        errors.content = "내용을 입력해 주세요.";
    }

    if (typeof body.important !== "boolean") {
        errors.important = "중요 공지 설정을 확인해 주세요.";
    }

    return errors;
}

export const handlers = [

    // -- 카테고리 목록 --
    http.get(mockApiUrl("/categories"), async () => {
        await delay(200);

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: MOCK_EQUIPMENT_CATEGORIES.map((category) => ({
                categoryId: category.categoryId,
                name: category.label,
            })),
        });
    }),

    // -- 공지사항 목록 --
    http.get(mockApiUrl("/notices"), async ({ request }) => {
        await delay(250);

        const searchParams = new URL(request.url).searchParams;
        const page = Number(searchParams.get("page") ?? 0);
        const size = Number(searchParams.get("size") ?? 20);
        const importantValue = searchParams.get("important");
        const important = importantValue === null
            ? null
            : importantValue === "true";

        if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1 || size > 100) {
            return HttpResponse.json(
                {
                    isSuccess: false,
                    code: "INVALID_PAGE_REQUEST",
                    message: "페이지 조건을 확인해 주세요.",
                    result: null,
                },
                { status: 400 },
            );
        }

        const filteredNotices = mockNotices
            .filter((notice) => important === null || notice.important === important)
            .sort((firstNotice, secondNotice) => {
                const importantOrder = Number(secondNotice.important) - Number(firstNotice.important);

                if (importantOrder !== 0) {
                    return importantOrder;
                }

                return new Date(secondNotice.createdAt) - new Date(firstNotice.createdAt);
            });
        const totalElements = filteredNotices.length;
        const totalPages = Math.ceil(totalElements / size);
        const notices = filteredNotices
            .slice(page * size, (page + 1) * size)
            .map(toMockNoticeSummary);

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: {
                notices,
                page,
                size,
                totalElements,
                totalPages,
                hasNext: page + 1 < totalPages,
            },
        });
    }),

    // -- 공지사항 작성 --
    http.post(mockApiUrl("/notices"), async ({ request }) => {
        await delay(300);

        const body = await request.json();
        const errors = getMockNoticeValidationErrors(body);

        if (Object.keys(errors).length > 0) {
            return HttpResponse.json(
                {
                    isSuccess: false,
                    code: "INVALID_NOTICE_REQUEST",
                    message: "입력값을 확인해 주세요.",
                    result: { errors },
                },
                { status: 400 },
            );
        }

        const now = new Date().toISOString();
        const notice = {
            noticeId: getNextMockNoticeId(),
            title: body.title,
            content: body.content,
            important: body.important,
            authorId: 1,
            authorName: "관리자",
            createdAt: now,
            updatedAt: now,
            attachments: [],
        };
        mockNotices.unshift(notice);

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: notice,
        });
    }),

    // -- 공지사항 상세 --
    http.get(mockApiUrl("/notices/:noticeId"), async ({ params }) => {
        await delay(200);

        const notice = mockNotices.find(
            (candidate) => String(candidate.noticeId) === String(params.noticeId),
        );

        if (!notice) {
            return HttpResponse.json(
                {
                    isSuccess: false,
                    code: "NOTICE_NOT_FOUND",
                    message: "공지사항을 찾을 수 없습니다.",
                    result: null,
                },
                { status: 404 },
            );
        }

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: notice,
        });
    }),

    // -- 공지사항 수정 --
    http.patch(mockApiUrl("/notices/:noticeId"), async ({ params, request }) => {
        await delay(300);

        const notice = mockNotices.find(
            (candidate) => String(candidate.noticeId) === String(params.noticeId),
        );

        if (!notice) {
            return HttpResponse.json(
                { message: "공지사항을 찾을 수 없습니다." },
                { status: 404 },
            );
        }

        const body = await request.json();
        const errors = getMockNoticeValidationErrors(body);

        if (Object.keys(errors).length > 0) {
            return HttpResponse.json(
                {
                    isSuccess: false,
                    code: "INVALID_NOTICE_REQUEST",
                    message: "입력값을 확인해 주세요.",
                    result: { errors },
                },
                { status: 400 },
            );
        }

        notice.title = body.title;
        notice.content = body.content;
        notice.important = body.important;
        notice.updatedAt = new Date().toISOString();

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: notice,
        });
    }),

    // -- 공지사항 삭제 --
    http.delete(mockApiUrl("/notices/:noticeId"), async ({ params }) => {
        await delay(300);

        const noticeIndex = mockNotices.findIndex(
            (candidate) => String(candidate.noticeId) === String(params.noticeId),
        );

        if (noticeIndex < 0) {
            return HttpResponse.json(
                { message: "공지사항을 찾을 수 없습니다." },
                { status: 404 },
            );
        }

        mockNotices.splice(noticeIndex, 1);

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: null,
        });
    }),

    // -- 공지사항 첨부파일 업로드 --
    http.post(mockApiUrl("/notices/:noticeId/attachments"), async ({ params, request }) => {
        await delay(250);

        const notice = mockNotices.find(
            (candidate) => String(candidate.noticeId) === String(params.noticeId),
        );

        if (!notice) {
            return HttpResponse.json(
                { message: "공지사항을 찾을 수 없습니다." },
                { status: 404 },
            );
        }

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || typeof file === "string") {
            return HttpResponse.json(
                { message: "첨부파일을 선택해 주세요." },
                { status: 400 },
            );
        }

        const attachmentId = getNextMockAttachmentId();
        const attachment = {
            attachmentId,
            originalFileName: file.name,
            contentType: file.type || "application/octet-stream",
            fileSize: file.size,
            downloadUrl: `/notices/${notice.noticeId}/attachments/${attachmentId}/download`,
            createdAt: new Date().toISOString(),
        };
        notice.attachments.push(attachment);
        notice.updatedAt = new Date().toISOString();

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: attachment,
        });
    }),

    // -- 공지사항 첨부파일 다운로드 --
    http.get(
        mockApiUrl("/notices/:noticeId/attachments/:attachmentId/download"),
        async ({ params }) => {
            await delay(150);

            const notice = mockNotices.find(
                (candidate) => String(candidate.noticeId) === String(params.noticeId),
            );
            const attachment = notice?.attachments.find(
                (candidate) => String(candidate.attachmentId) === String(params.attachmentId),
            );

            if (!attachment) {
                return HttpResponse.json(
                    { message: "첨부파일을 찾을 수 없습니다." },
                    { status: 404 },
                );
            }

            return new HttpResponse(
                new Blob([`${attachment.originalFileName} mock 파일`], {
                    type: attachment.contentType,
                }),
                {
                    status: 200,
                    headers: {
                        "Content-Type": attachment.contentType,
                        "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.originalFileName)}"`,
                    },
                },
            );
        },
    ),

    // -- 관리자 회원 목록 --
    http.get(mockApiUrl("/admin/users"), async ({ request }) => {
        await delay(250);

        const searchParams = new URL(request.url).searchParams;
        const page = Number(searchParams.get("page") ?? 0);
        const size = Number(searchParams.get("size") ?? 20);
        const keyword = searchParams.get("keyword")?.trim().toLowerCase() ?? "";
        const status = searchParams.get("status") ?? "";
        const college = searchParams.get("college")?.trim() ?? "";
        const department = searchParams.get("department")?.trim() ?? "";

        const filteredMembers = MOCK_MEMBERS.map(toMockMemberResponse).filter((member) => {
            const matchesKeyword =
                !keyword ||
                member.name.toLowerCase().includes(keyword) ||
                member.studentId.toLowerCase().includes(keyword);
            const matchesStatus = !status || member.status === status;
            const matchesCollege = !college || member.college === college;
            const matchesDepartment = !department || member.department === department;

            return matchesKeyword && matchesStatus && matchesCollege && matchesDepartment;
        });

        const totalElements = filteredMembers.length;
        const totalPages = Math.ceil(totalElements / size);
        const usersPage = filteredMembers.slice(page * size, (page + 1) * size);

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: {
                users: usersPage,
                page,
                size,
                totalElements,
                totalPages,
                hasNext: page + 1 < totalPages,
            },
        });
    }),

    // -- 관리자 근로생 목록 --
    http.get(mockApiUrl("/admin/users/staff"), async () => {
        await delay(200);

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: [
                {
                    userId: 1001,
                    loginId: "worker01",
                    name: "가상근로생",
                },
            ],
        });
    }),

    // -- 관리자 회원 상세 --
    http.get(mockApiUrl("/admin/users/:userId"), async ({ params }) => {
        await delay(200);

        const member = MOCK_MEMBERS.find(
            (candidate) => String(candidate.id) === String(params.userId),
        );

        if (!member) {
            return HttpResponse.json(
                {
                    isSuccess: false,
                    code: "MEMBER_NOT_FOUND",
                    message: "회원을 찾을 수 없습니다.",
                    result: null,
                },
                { status: 404 },
            );
        }

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: toMockMemberResponse(member),
        });
    }),

    // -- 관리자 회원 수정 --
    http.patch(mockApiUrl("/admin/users/:userId"), async ({ params, request }) => {
        await delay(300);

        const member = MOCK_MEMBERS.find(
            (candidate) => String(candidate.id) === String(params.userId),
        );

        if (!member) {
            return HttpResponse.json(
                {
                    isSuccess: false,
                    code: "MEMBER_NOT_FOUND",
                    message: "회원을 찾을 수 없습니다.",
                    result: null,
                },
                { status: 404 },
            );
        }

        const body = await request.json();

        if (Object.hasOwn(body, "name")) member.name = body.name;
        if (Object.hasOwn(body, "email")) member.email = body.email;
        if (Object.hasOwn(body, "phoneNumber")) member.phone = body.phoneNumber;
        if (Object.hasOwn(body, "college")) member.college = body.college;
        if (Object.hasOwn(body, "department")) member.department = body.department;

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: toMockMemberResponse(member),
        });
    }),

    // -- 임시 내 찜 기자재 목록 --
    // 백엔드의 찜 목록 경로가 확정되기 전까지 getMyWishlistedEquipmentModels() 요청을 응답합니다.
    // mock DB의 isWish가 true인 모델만 고른 뒤, 일반 목록과 같은 page/size 응답 규격으로 반환합니다.
    http.get(mockApiUrl("/users/me/wishlists/equipment-models"), async ({ request }) => {
        await delay(300);

        const searchParams = new URL(request.url).searchParams;
        const page = Number(searchParams.get("page") ?? 0);
        const size = Number(searchParams.get("size") ?? 20);

        if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
            return HttpResponse.json(
                {
                    isSuccess: false,
                    code: "400",
                    message: "페이지 번호 또는 페이지 크기가 올바르지 않습니다.",
                    result: null,
                },
                { status: 400 }
            );
        }

        const wishlistedModels = equipmentModels.filter((model) => model.isWish);
        const totalElements = wishlistedModels.length;
        const totalPages = Math.ceil(totalElements / size);
        const content = wishlistedModels.slice(page * size, (page + 1) * size);

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: {
                content,
                page,
                size,
                totalElements,
                totalPages,
            },
        });
    }),

    // -- 공통 기자재 모델 목록 --
    http.get(mockApiUrl("/equipment-models"), async ({ request }) => {
        await delay(300);

        const searchParams = new URL(request.url).searchParams;
        const page = Number(searchParams.get("page") ?? 0);
        const size = Number(searchParams.get("size") ?? 20);
        const categoryId = searchParams.get("category_id");
        const keyword = searchParams.get("keyword")?.trim().toLowerCase() ?? "";

        if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1) {
            return HttpResponse.json(
                {
                    isSuccess: false,
                    code: "400",
                    message: "페이지 번호 또는 페이지 크기가 올바르지 않습니다.",
                    result: null,
                },
                { status: 400 }
            );
        }

        const filteredModels = equipmentModels.filter((model) => {
            const matchesCategory =
                !categoryId || model.categoryId === Number(categoryId);
            const matchesKeyword =
                !keyword || model.modelName.toLowerCase().includes(keyword);

            return matchesCategory && matchesKeyword;
        });

        const totalElements = filteredModels.length;
        const totalPages = Math.ceil(totalElements / size);
        const content = filteredModels.slice(page * size, (page + 1) * size);

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: {
                content,
                page,
                size,
                totalElements,
                totalPages,
            },
        });
    }),

    // -- 로그인 --
    http.post(mockApiUrl("/login"), async ({ request }) => {
        await delay(400); // 로딩 스피너와 버튼 비활성 상태를 확인하려고 지연시켜.

        const { loginId, password } = await request.json();

        if (!loginId || !password) {
            return HttpResponse.json(
                { message: "아이디와 비밀번호를 모두 입력해 주세요." },
                { status: 400 }
            );
        }

        const user = users.find(
            (u) => u.id === loginId && u.password === password
        );

        if (!user) {
            return HttpResponse.json(
                { message: "이메일 또는 비밀번호를 확인해 주세요." },
                { status: 401 }
            );
        }

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: {
                userId: user.userId,
                loginId: user.id,
                name: user.name,
                role: user.role,
                status: "ACTIVE",
                accessToken: makeToken(user.id),
            },
        });
    }),

    // -- 로그아웃 --
    http.post(mockApiUrl("/logout"), async ({ request }) => {
        await delay(200);

        const id = parseToken(request.headers.get("Authorization"));

        if (!id) {
            return HttpResponse.json(
                { message: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: null,
        });
    }),

    // -- 회원가입 --
    http.post(mockApiUrl("/users"), async ({ request }) => {
        await delay(400);

        const body = await request.json();

        // 실제 SignupRequestDTO 기준으로 필드별 오류를 만들어.
        const errors = {};
        if (!body.email?.includes("@")) errors.email = "올바른 이메일 형식이 아닙니다.";
        if (!body.password || body.password.length < 8 || body.password.length > 16)
            errors.password = "비밀번호는 8자 이상 16자 이하여야 합니다.";
        if (!body.name) errors.name = "이름을 입력해 주세요.";
        if (!/^[A-Z][0-9]{6}$/.test(body.studentId ?? ""))
            errors.studentId = "학번 형식을 확인해 주세요.";
        if (!body.phoneNumber) errors.phoneNumber = "전화번호를 입력해 주세요.";
        if (!body.college) errors.college = "단과대학을 입력해 주세요.";
        if (!body.department) errors.department = "학과를 입력해 주세요.";

        if (Object.keys(errors).length > 0) {
            return HttpResponse.json(
                {
                    isSuccess: false,
                    code: "INVALID_SIGNUP_REQUEST",
                    message: "입력값을 확인해 주세요.",
                    result: { errors },
                },
                { status: 400 }
            );
        }

        // 중복 학번 응답도 같은 서버 필드명으로 돌려줘.
        if (users.some((u) => u.id === body.studentId)) {
            return HttpResponse.json(
                {
                    isSuccess: false,
                    code: "DUPLICATE_STUDENT_ID",
                    message: "이미 가입된 학번입니다.",
                    result: { errors: { studentId: "이미 가입된 학번입니다." } },
                },
                { status: 409 }
            );
        }

        const user = {
            id: body.studentId,
            userId: users.length + 1,
            ...body,
            role: "student",
            status: "ACTIVE",
            profile_image_url: null,
        };
        users.push(user);

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: {
                userId: user.userId,
                loginId: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                college: user.college,
                department: user.department,
                role: "STUDENT",
                status: user.status,
            },
        });
    }),

    // -- 내정보 --
    http.get(mockApiUrl("/users/me"), async ({ request }) => {
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

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: toMockMyInfoResponse(user),
        });
    }),

    // -- 내정보 수정 --
    http.patch(mockApiUrl("/users/me"), async ({ request }) => {
        await delay(300);

        const id = parseToken(request.headers.get("Authorization"));
        const user = users.find((candidate) => candidate.id === id);

        if (!user) {
            return HttpResponse.json(
                { message: "로그인이 필요합니다." },
                { status: 401 },
            );
        }

        const body = await request.json();
        const errors = {};

        if (!body.email?.includes("@")) {
            errors.email = "올바른 이메일 형식이 아닙니다.";
        }

        if (!/^01[016789][0-9]{7,8}$/.test(body.phoneNumber ?? "")) {
            errors.phoneNumber = "전화번호 형식을 확인해 주세요.";
        }

        if (Object.keys(errors).length > 0) {
            return HttpResponse.json(
                {
                    isSuccess: false,
                    code: "INVALID_MY_INFO_REQUEST",
                    message: "입력값을 확인해 주세요.",
                    result: { errors },
                },
                { status: 400 },
            );
        }

        user.email = body.email;
        user.phoneNumber = body.phoneNumber;

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: toMockMyInfoResponse(user),
        });
    }),

    // -- 프로필 사진 수정 --
    http.patch(mockApiUrl("/users/me/profile-image"), async ({ request }) => {
        await delay(300);

        const id = parseToken(request.headers.get("Authorization"));
        const user = users.find((candidate) => candidate.id === id);

        if (!user) {
            return HttpResponse.json(
                { message: "로그인이 필요합니다." },
                { status: 401 },
            );
        }

        const formData = await request.formData();
        const image = formData.get("image");

        if (!image || typeof image === "string") {
            return HttpResponse.json(
                { message: "프로필 이미지를 선택해 주세요." },
                { status: 400 },
            );
        }

        user.profile_image_url = `/images/hongikLogo-circle.png?mock=${Date.now()}`;

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: toMockMyInfoResponse(user),
        });
    }),

    // -- 회원탈퇴 --
    http.delete(mockApiUrl("/users/me"), async ({ request }) => {
        await delay(300);

        const id = parseToken(request.headers.get("Authorization"));
        const userIndex = users.findIndex((candidate) => candidate.id === id);

        if (userIndex < 0) {
            return HttpResponse.json(
                { message: "로그인이 필요합니다." },
                { status: 401 },
            );
        }

        users.splice(userIndex, 1);

        return HttpResponse.json({
            isSuccess: true,
            code: "200",
            message: "성공",
            result: null,
        });
    }),
];
