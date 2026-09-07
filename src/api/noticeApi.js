// 목록용 요약
function toNoticeSummary(notice) {
    return {
        noticeId: notice.noticeId,
        title: notice.title,
        summary: (notice.content ?? "").trim().slice(0, 220), // 220자까지만 가져오기
        hasAttachment: notice.attachments.length > 0, // 개수가 아닌 boolean으로
        viewCount: notice.viewCount,
        important: notice.important,                  // '중요공지' 표시에 필요
        createdAt: notice.createdAt,
    };
}


// 임시 API 1 : 목록용
export async function fetchNotices({ page = 0, size = 10, }) {

    // 네트워크 지연 흉내 (로딩 UI 테스트용)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 삭제된 공지 제외
    const activeNotices = MOCK_NOTICES.filter(
        (notice) => notice.deletedAt === null,
    );

    // 중요 공지 우선
    const sortedNotices = [...activeNotices].sort(
        (firstNotice, secondNotice) => {
            // 중요 공지 우선
            const importantOrder =
                Number(secondNotice.important) -
                Number(firstNotice.important);

            if (importantOrder !== 0) {
                return importantOrder;
            }

            // 같은 중요도라면 최신 작성일이 상단에 오도록
            return (
                new Date(secondNotice.createdAt) -
                new Date(firstNotice.createdAt)
            );
        },
    );

    const startIndex = page * size;
    const endIndex = startIndex + size;

    // 잘라낸 뒤 요약 형태로 변환
    const content = sortedNotices.slice(startIndex, endIndex).map(toNoticeSummary);


    return {
        content,                                // 현재 페이지에 해당하는 공지사항 데이터 배열
        page,                                   // 현재 페이지 번호
        size,                                   // 한 페이지당 요청한 데이터 개수
        totalElements: MOCK_NOTICES.length,     // 전체 공지사항 데이터 총 개수
        totalPages: Math.ceil(sortedNotices.length / size), // 전체 페이지 수 (전체 개수 / 페이지 크기 올림)
        last: endIndex >= MOCK_NOTICES.length,  // 마지막 페이지 여부 (더 이상 불러올 데이터가 없으면 true)
    };
}


// 임시 API 2 : 상세 조회용. 단건, 전체 필드
export async function fetchNoticeDetail(noticeId) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const notice = MOCK_NOTICES.find(
        (item) => item.noticeId === Number(noticeId),
    );

    // 상세는 원본 그대로
    return { ...notice };
}


// 임시 목업 데이터 20개
export const MOCK_NOTICES = [
    {
        noticeId: 1,
        authorId: 101,
        title: "[필독] 2026학년도 2학기 시스템 정기 점검 안내",
        content: "점검 안내입니다.".repeat(1),
        viewCount: 1240,
        important: true,
        createdAt: "2026-08-01T09:00:00",
        updatedAt: "2026-08-01T09:00:00",
        deletedAt: null,
        attachments: [
            {
                attachmentId: 1,
                originalFileName: "2026_시스템점검계획서.pdf",
                storedFileName: "20260801_sys_check_a1b2c3d4.pdf",
                fileUrl: "https://storage.example.com/notices/20260801_sys_check_a1b2c3d4.pdf",
                contentType: "application/pdf",
                fileSize: 2048576,
                createdAt: "2026-08-01T09:00:00"
            }
        ]
    },
    {
        noticeId: 2,
        authorId: 101,
        title: "[안내] 기자재 대여 신청 및 반납 정책 변경 안내",
        content: "기자재 대여 및 반납 절차가 변경되었습니다. 자세한 내용은 첨부파일을 확인해 주세요. ".repeat(12),
        viewCount: 850,
        important: false,
        createdAt: "2026-08-03T10:30:00",
        updatedAt: "2026-08-04T14:20:00",
        deletedAt: null,
        attachments: [
            {
                attachmentId: 2,
                originalFileName: "기자재_대여_가이드라인_v2.pdf",
                storedFileName: "20260803_rental_guide_e5f6g7h8.pdf",
                fileUrl: "https://storage.example.com/notices/20260803_rental_guide_e5f6g7h8.pdf",
                contentType: "application/pdf",
                fileSize: 1542000,
                createdAt: "2026-08-03T10:30:00"
            },
            {
                attachmentId: 3,
                originalFileName: "대여신청서_양식.docx",
                storedFileName: "20260803_rental_form_i9j0k1l2.docx",
                fileUrl: "https://storage.example.com/notices/20260803_rental_form_i9j0k1l2.docx",
                contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                fileSize: 345000,
                createdAt: "2026-08-03T10:30:00"
            },
            { attachmentId: 4, originalFileName: "대여_절차_안내.pdf", storedFileName: "rental_process.pdf", fileUrl: "https://storage.example.com/notices/2/rental_process.pdf", contentType: "application/pdf", fileSize: 210000, createdAt: "2026-08-03T10:30:00" },
            { attachmentId: 5, originalFileName: "반납_체크리스트.pdf", storedFileName: "return_checklist.pdf", fileUrl: "https://storage.example.com/notices/2/return_checklist.pdf", contentType: "application/pdf", fileSize: 180000, createdAt: "2026-08-03T10:30:00" },
            { attachmentId: 6, originalFileName: "이용자_가이드.pdf", storedFileName: "user_guide.pdf", fileUrl: "https://storage.example.com/notices/2/user_guide.pdf", contentType: "application/pdf", fileSize: 320000, createdAt: "2026-08-03T10:30:00" },
            { attachmentId: 7, originalFileName: "신청서_작성예시.pdf", storedFileName: "application_example.pdf", fileUrl: "https://storage.example.com/notices/2/application_example.pdf", contentType: "application/pdf", fileSize: 270000, createdAt: "2026-08-03T10:30:00" },
            { attachmentId: 8, originalFileName: "장비_수령안내.pdf", storedFileName: "equipment_pickup.pdf", fileUrl: "https://storage.example.com/notices/2/equipment_pickup.pdf", contentType: "application/pdf", fileSize: 150000, createdAt: "2026-08-03T10:30:00" },
            { attachmentId: 9, originalFileName: "장비_반납안내.pdf", storedFileName: "equipment_return.pdf", fileUrl: "https://storage.example.com/notices/2/equipment_return.pdf", contentType: "application/pdf", fileSize: 160000, createdAt: "2026-08-03T10:30:00" },
            { attachmentId: 10, originalFileName: "자주_묻는_질문.pdf", storedFileName: "rental_faq.pdf", fileUrl: "https://storage.example.com/notices/2/rental_faq.pdf", contentType: "application/pdf", fileSize: 240000, createdAt: "2026-08-03T10:30:00" },
            { attachmentId: 11, originalFileName: "정책_변경요약.pdf", storedFileName: "policy_summary.pdf", fileUrl: "https://storage.example.com/notices/2/policy_summary.pdf", contentType: "application/pdf", fileSize: 190000, createdAt: "2026-08-03T10:30:00" }
        ]
    },
    {
        noticeId: 3,
        authorId: 102,
        title: "신규 촬영 장비(Sony A7M4) 추가 도입 안내",
        content: "신규 촬영 장비가 추가되었습니다. 대여 현황에서 신청할 수 있습니다. 이용 전 장비 상태를 확인해 주세요. ".repeat(3),
        viewCount: 420,
        important: false,
        createdAt: "2026-08-05T11:15:00",
        updatedAt: "2026-08-05T11:15:00",
        deletedAt: null,
        attachments: []
    },
    {
        noticeId: 4,
        authorId: 103,
        title: "여름방학 기간 중 대여실 운영 시간 안내",
        content: "방학 기간 운영 시간과 휴무일을 안내드립니다. 방문 전 운영 일정을 확인해 주세요. ".repeat(8),
        viewCount: 310,
        important: false,
        createdAt: "2026-08-06T13:00:00",
        updatedAt: "2026-08-06T13:00:00",
        deletedAt: null,
        attachments: []
    },
    {
        noticeId: 5,
        authorId: 101,
        title: "개인정보 처리방침 개정 안내",
        content: "개인정보 처리방침 개정 내용을 안내드립니다. 변경되는 항목과 적용일을 확인해 주세요. ".repeat(15),
        viewCount: 150,
        important: false,
        createdAt: "2026-08-08T16:45:00",
        updatedAt: "2026-08-08T16:45:00",
        deletedAt: null,
        attachments: []
    },
    {
        noticeId: 6,
        authorId: 102,
        title: "기자재 파손 및 분실 시 보상 기준 안내",
        content: "기자재 파손 및 분실 시 처리 절차와 보상 기준을 안내드립니다. 사용 전후 장비 상태를 꼼꼼히 확인하고 이상이 있으면 즉시 담당자에게 알려 주세요. ".repeat(18),
        viewCount: 590,
        important: false,
        createdAt: "2026-08-09T09:30:00",
        updatedAt: "2026-08-09T09:30:00",
        deletedAt: null,
        attachments: [
            {
                attachmentId: 4,
                originalFileName: "장비파손_손상기준표.png",
                storedFileName: "20260809_damage_chart_m3n4o5p6.png",
                fileUrl: "https://storage.example.com/notices/20260809_damage_chart_m3n4o5p6.png",
                contentType: "image/png",
                fileSize: 890120,
                createdAt: "2026-08-09T09:30:00"
            },
            { attachmentId: 12, originalFileName: "파손_신고서.pdf", storedFileName: "damage_report.pdf", fileUrl: "https://storage.example.com/notices/6/damage_report.pdf", contentType: "application/pdf", fileSize: 130000, createdAt: "2026-08-09T09:30:00" },
            { attachmentId: 13, originalFileName: "분실_신고서.pdf", storedFileName: "loss_report.pdf", fileUrl: "https://storage.example.com/notices/6/loss_report.pdf", contentType: "application/pdf", fileSize: 140000, createdAt: "2026-08-09T09:30:00" }
        ]
    },
    {
        noticeId: 7,
        authorId: 103,
        title: "연동 시스템 업데이트 작업에 따른 일시 오류 조치 완료",
        content: "서버 응답 지연 문제의 조치가 완료되었습니다. 현재 모든 서비스가 정상적으로 운영되고 있습니다. 이용에 불편을 드려 죄송합니다. ".repeat(12),
        viewCount: 95,
        important: false,
        createdAt: "2026-08-11T11:00:00",
        updatedAt: "2026-08-11T11:00:00",
        deletedAt: null,
        attachments: []
    },
    {
        noticeId: 8,
        authorId: 101,
        title: "2026-2학기 학생회 동아리 지원 장비 신청 안내",
        content: "학생회와 동아리 행사를 위한 장비 장기 대여 신청을 안내드립니다. 신청 기간, 대상 장비, 제출 서류와 반납 일정을 확인해 주세요. ".repeat(18),
        viewCount: 270,
        important: false,
        createdAt: "2026-08-12T14:00:00",
        updatedAt: "2026-08-12T14:00:00",
        deletedAt: null,
        attachments: [
            {
                attachmentId: 5,
                originalFileName: "동아리_장기대여_신청서.hwp",
                storedFileName: "20260812_club_rental_q7r8s9t0.hwp",
                fileUrl: "https://storage.example.com/notices/20260812_club_rental_q7r8s9t0.hwp",
                contentType: "application/x-hwp",
                fileSize: 120500,
                createdAt: "2026-08-12T14:00:00"
            },
            { attachmentId: 14, originalFileName: "동아리_행사계획서.pdf", storedFileName: "club_plan.pdf", fileUrl: "https://storage.example.com/notices/8/club_plan.pdf", contentType: "application/pdf", fileSize: 220000, createdAt: "2026-08-12T14:00:00" },
            { attachmentId: 15, originalFileName: "장비_목록.pdf", storedFileName: "equipment_list.pdf", fileUrl: "https://storage.example.com/notices/8/equipment_list.pdf", contentType: "application/pdf", fileSize: 260000, createdAt: "2026-08-12T14:00:00" },
            { attachmentId: 16, originalFileName: "대여_동의서.pdf", storedFileName: "rental_consent.pdf", fileUrl: "https://storage.example.com/notices/8/rental_consent.pdf", contentType: "application/pdf", fileSize: 190000, createdAt: "2026-08-12T14:00:00" }
        ]
    },
    {
        noticeId: 9,
        authorId: 102,
        title: "[임시] 삭제된 테스트용 공지사항",
        content: "삭제 처리된 공지사항입니다. ".repeat(30),
        viewCount: 12,
        important: false,
        createdAt: "2026-08-13T10:00:00",
        updatedAt: "2026-08-13T10:05:00",
        deletedAt: "2026-08-13T10:05:00",
        attachments: []
    },
    {
        noticeId: 10,
        authorId: 101,
        title: "2026년 하반기 만족도 조사 이벤트 당첨자 발표",
        content: "만족도 조사 이벤트 결과와 당첨자 확인 방법을 안내드립니다. 당첨자는 첨부된 명단에서 확인할 수 있으며, 문의사항은 운영 담당자에게 전달해 주세요. ".repeat(14),
        viewCount: 180,
        important: false,
        createdAt: "2026-08-14T09:00:00",
        updatedAt: "2026-08-14T09:00:00",
        deletedAt: null,
        attachments: [
            {
                attachmentId: 6,
                originalFileName: "이벤트_당첨자_명단.xlsx",
                storedFileName: "20260814_event_winners_u1v2w3x4.xlsx",
                fileUrl: "https://storage.example.com/notices/20260814_event_winners_u1v2w3x4.xlsx",
                contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileSize: 52300,
                createdAt: "2026-08-14T09:00:00"
            },
            { attachmentId: 17, originalFileName: "당첨자_확인방법.pdf", storedFileName: "winner_guide.pdf", fileUrl: "https://storage.example.com/notices/10/winner_guide.pdf", contentType: "application/pdf", fileSize: 120000, createdAt: "2026-08-14T09:00:00" },
            { attachmentId: 18, originalFileName: "이벤트_안내.pdf", storedFileName: "event_guide.pdf", fileUrl: "https://storage.example.com/notices/10/event_guide.pdf", contentType: "application/pdf", fileSize: 210000, createdAt: "2026-08-14T09:00:00" },
            { attachmentId: 19, originalFileName: "경품_수령서.pdf", storedFileName: "prize_receipt.pdf", fileUrl: "https://storage.example.com/notices/10/prize_receipt.pdf", contentType: "application/pdf", fileSize: 110000, createdAt: "2026-08-14T09:00:00" },
            { attachmentId: 20, originalFileName: "만족도_조사결과.pdf", storedFileName: "survey_result.pdf", fileUrl: "https://storage.example.com/notices/10/survey_result.pdf", contentType: "application/pdf", fileSize: 340000, createdAt: "2026-08-14T09:00:00" }
        ]
    },
    {
        noticeId: 11,
        authorId: 103,
        title: "음향 및 조명 장비 반납 시 주의사항 안내",
        content: "음향 및 조명 장비 반납 시 구성품을 확인해 주세요. 케이블, 배터리, 케이스와 부속품의 수량을 확인한 뒤 반납해야 합니다. 이상이 발견되면 반납 담당자에게 알려 주세요. ".repeat(38),
        viewCount: 220,
        important: false,
        createdAt: "2026-08-15T15:20:00",
        updatedAt: "2026-08-15T15:20:00",
        deletedAt: null,
        attachments: []
    },
    {
        noticeId: 12,
        authorId: 101,
        title: "추석 연휴 기간 기자재 대여실 휴무 안내",
        content: "추석 연휴 기간 대여실 휴무 일정을 안내드립니다. 휴무 기간에는 대여와 반납이 진행되지 않으므로 이용 예정인 분들은 사전에 일정을 조정해 주세요. ".repeat(44),
        viewCount: 380,
        important: false,
        createdAt: "2026-08-16T11:00:00",
        updatedAt: "2026-08-16T11:00:00",
        deletedAt: null,
        attachments: []
    },
    {
        noticeId: 13,
        authorId: 102,
        title: "삼각대 및 세트 보관함 위치 변경 안내",
        content: "대여실 내부 구조 변경에 따라 보관함 위치가 변경되었습니다. 삼각대와 촬영 보조 장비는 새로운 위치에 보관해 주세요. 이용 후에는 다른 사용자가 찾기 쉽도록 정리해 주세요. ".repeat(20),
        viewCount: 195,
        important: false,
        createdAt: "2026-08-17T13:40:00",
        updatedAt: "2026-08-17T13:40:00",
        deletedAt: null,
        attachments: [
            {
                attachmentId: 7,
                originalFileName: "대여실_내부배치도.jpg",
                storedFileName: "20260817_layout_map_y5z6a7b8.jpg",
                fileUrl: "https://storage.example.com/notices/20260817_layout_map_y5z6a7b8.jpg",
                contentType: "image/jpeg",
                fileSize: 1048576,
                createdAt: "2026-08-17T13:40:00"
            },
            { attachmentId: 21, originalFileName: "보관함_배치도.pdf", storedFileName: "storage_map.pdf", fileUrl: "https://storage.example.com/notices/13/storage_map.pdf", contentType: "application/pdf", fileSize: 250000, createdAt: "2026-08-17T13:40:00" },
            { attachmentId: 22, originalFileName: "장비_정리수칙.pdf", storedFileName: "storage_rules.pdf", fileUrl: "https://storage.example.com/notices/13/storage_rules.pdf", contentType: "application/pdf", fileSize: 170000, createdAt: "2026-08-17T13:40:00" },
            { attachmentId: 23, originalFileName: "대여실_안내도.pdf", storedFileName: "rental_room_map.pdf", fileUrl: "https://storage.example.com/notices/13/rental_room_map.pdf", contentType: "application/pdf", fileSize: 310000, createdAt: "2026-08-17T13:40:00" },
            { attachmentId: 24, originalFileName: "이동_장비목록.pdf", storedFileName: "move_equipment_list.pdf", fileUrl: "https://storage.example.com/notices/13/move_equipment_list.pdf", contentType: "application/pdf", fileSize: 200000, createdAt: "2026-08-17T13:40:00" },
            { attachmentId: 25, originalFileName: "보관_라벨양식.pdf", storedFileName: "storage_label.pdf", fileUrl: "https://storage.example.com/notices/13/storage_label.pdf", contentType: "application/pdf", fileSize: 90000, createdAt: "2026-08-17T13:40:00" }
        ]
    },
    {
        noticeId: 14,
        authorId: 103,
        title: "무선 마이크 주파수 채널 설정 관련 주의사항",
        content: "무선 마이크 사용 전 주파수 채널을 확인해 주세요. 촬영 공간을 함께 사용하는 팀이 있을 경우 채널이 겹치지 않도록 담당자와 조율해야 합니다. 사용 후에는 설정을 초기화해 주세요. ".repeat(56),
        viewCount: 160,
        important: false,
        createdAt: "2026-08-18T10:10:00",
        updatedAt: "2026-08-18T10:10:00",
        deletedAt: null,
        attachments: []
    },
    {
        noticeId: 15,
        authorId: 101,
        title: "노후 촬영 장비(Canon 80D) 불용 처리 안내",
        content: "노후 촬영 장비의 불용 처리 일정을 안내드립니다. 대여 목록에서 제외되는 장비와 대체 가능한 장비를 확인해 주세요. 장비 교체에 따른 신청 방법도 함께 안내합니다. ".repeat(62),
        viewCount: 290,
        important: false,
        createdAt: "2026-08-19T17:00:00",
        updatedAt: "2026-08-19T17:00:00",
        deletedAt: null,
        attachments: []
    },
    {
        noticeId: 16,
        authorId: 102,
        title: "웹사이트 이용 약관 개정 사전 고지",
        content: "서비스 이용 약관 개정 내용을 안내드립니다. 회원의 권리와 의무, 서비스 이용 기준, 개인정보 관련 조항의 변경사항을 첨부된 신구대조표에서 확인해 주세요. ".repeat(70),
        viewCount: 88,
        important: false,
        createdAt: "2026-08-20T09:30:00",
        updatedAt: "2026-08-20T09:30:00",
        deletedAt: null,
        attachments: [
            {
                attachmentId: 8,
                originalFileName: "이용약관_신구대조표.pdf",
                storedFileName: "20260820_terms_compare_c9d0e1f2.pdf",
                fileUrl: "https://storage.example.com/notices/20260820_terms_compare_c9d0e1f2.pdf",
                contentType: "application/pdf",
                fileSize: 620000,
                createdAt: "2026-08-20T09:30:00"
            },
            { attachmentId: 26, originalFileName: "약관_개정안.pdf", storedFileName: "terms_revision.pdf", fileUrl: "https://storage.example.com/notices/16/terms_revision.pdf", contentType: "application/pdf", fileSize: 420000, createdAt: "2026-08-20T09:30:00" },
            { attachmentId: 27, originalFileName: "개인정보_변경안내.pdf", storedFileName: "privacy_change.pdf", fileUrl: "https://storage.example.com/notices/16/privacy_change.pdf", contentType: "application/pdf", fileSize: 280000, createdAt: "2026-08-20T09:30:00" },
            { attachmentId: 28, originalFileName: "회원_권리안내.pdf", storedFileName: "member_rights.pdf", fileUrl: "https://storage.example.com/notices/16/member_rights.pdf", contentType: "application/pdf", fileSize: 230000, createdAt: "2026-08-20T09:30:00" },
            { attachmentId: 29, originalFileName: "서비스_이용기준.pdf", storedFileName: "service_rules.pdf", fileUrl: "https://storage.example.com/notices/16/service_rules.pdf", contentType: "application/pdf", fileSize: 190000, createdAt: "2026-08-20T09:30:00" },
            { attachmentId: 30, originalFileName: "신구대조표_요약.pdf", storedFileName: "terms_summary.pdf", fileUrl: "https://storage.example.com/notices/16/terms_summary.pdf", contentType: "application/pdf", fileSize: 160000, createdAt: "2026-08-20T09:30:00" },
            { attachmentId: 31, originalFileName: "시행일_안내.pdf", storedFileName: "effective_date.pdf", fileUrl: "https://storage.example.com/notices/16/effective_date.pdf", contentType: "application/pdf", fileSize: 100000, createdAt: "2026-08-20T09:30:00" }
        ]
    },
    {
        noticeId: 17,
        authorId: 103,
        title: "대여 연체 보상금 제도 정식 시행 안내",
        content: "대여 장비 반납 지연에 대한 보상금 및 이용 제한 제도를 안내드립니다. 반납 예정 시각을 지키기 어려운 경우 사전에 담당자에게 연락해야 하며, 연체 기간과 장비 종류에 따라 처리 기준이 달라질 수 있습니다. ".repeat(78),
        viewCount: 510,
        important: true,
        createdAt: "2026-08-21T14:15:00",
        updatedAt: "2026-08-21T14:15:00",
        deletedAt: null,
        attachments: [
            { attachmentId: 32, originalFileName: "연체_기준표.pdf", storedFileName: "late_fee_rules.pdf", fileUrl: "https://storage.example.com/notices/17/late_fee_rules.pdf", contentType: "application/pdf", fileSize: 180000, createdAt: "2026-08-21T14:15:00" },
            { attachmentId: 33, originalFileName: "보상금_안내.pdf", storedFileName: "compensation_guide.pdf", fileUrl: "https://storage.example.com/notices/17/compensation_guide.pdf", contentType: "application/pdf", fileSize: 210000, createdAt: "2026-08-21T14:15:00" },
            { attachmentId: 34, originalFileName: "반납_기한표.pdf", storedFileName: "return_deadline.pdf", fileUrl: "https://storage.example.com/notices/17/return_deadline.pdf", contentType: "application/pdf", fileSize: 130000, createdAt: "2026-08-21T14:15:00" },
            { attachmentId: 35, originalFileName: "이용제한_안내.pdf", storedFileName: "rental_restriction.pdf", fileUrl: "https://storage.example.com/notices/17/rental_restriction.pdf", contentType: "application/pdf", fileSize: 160000, createdAt: "2026-08-21T14:15:00" },
            { attachmentId: 36, originalFileName: "문의_양식.pdf", storedFileName: "late_inquiry.pdf", fileUrl: "https://storage.example.com/notices/17/late_inquiry.pdf", contentType: "application/pdf", fileSize: 90000, createdAt: "2026-08-21T14:15:00" },
            { attachmentId: 37, originalFileName: "예외_처리기준.pdf", storedFileName: "exception_rules.pdf", fileUrl: "https://storage.example.com/notices/17/exception_rules.pdf", contentType: "application/pdf", fileSize: 220000, createdAt: "2026-08-21T14:15:00" },
            { attachmentId: 38, originalFileName: "회원_확인사항.pdf", storedFileName: "member_checklist.pdf", fileUrl: "https://storage.example.com/notices/17/member_checklist.pdf", contentType: "application/pdf", fileSize: 110000, createdAt: "2026-08-21T14:15:00" },
            { attachmentId: 39, originalFileName: "자주_묻는_질문.pdf", storedFileName: "late_faq.pdf", fileUrl: "https://storage.example.com/notices/17/late_faq.pdf", contentType: "application/pdf", fileSize: 240000, createdAt: "2026-08-21T14:15:00" }
        ]
    },
    {
        noticeId: 18,
        authorId: 101,
        title: "스튜디오 대관 및 장비 동시 신청 기능 오픈",
        content: "스튜디오 대관과 장비 대여를 한 번에 신청할 수 있는 기능이 추가되었습니다. 예약 화면에서 사용 목적과 일정을 입력한 뒤 필요한 장비를 선택하면 신청이 완료됩니다. 신청 전 이용 가능 여부와 반납 일정을 확인해 주세요. ".repeat(90),
        viewCount: 340,
        important: false,
        createdAt: "2026-08-22T11:50:00",
        updatedAt: "2026-08-22T11:50:00",
        deletedAt: null,
        attachments: [
            { attachmentId: 40, originalFileName: "스튜디오_예약안내.pdf", storedFileName: "studio_booking.pdf", fileUrl: "https://storage.example.com/notices/18/studio_booking.pdf", contentType: "application/pdf", fileSize: 190000, createdAt: "2026-08-22T11:50:00" },
            { attachmentId: 41, originalFileName: "장비_동시신청안내.pdf", storedFileName: "equipment_booking.pdf", fileUrl: "https://storage.example.com/notices/18/equipment_booking.pdf", contentType: "application/pdf", fileSize: 230000, createdAt: "2026-08-22T11:50:00" },
            { attachmentId: 42, originalFileName: "예약_작성예시.pdf", storedFileName: "booking_example.pdf", fileUrl: "https://storage.example.com/notices/18/booking_example.pdf", contentType: "application/pdf", fileSize: 170000, createdAt: "2026-08-22T11:50:00" },
            { attachmentId: 43, originalFileName: "시설_이용수칙.pdf", storedFileName: "facility_rules.pdf", fileUrl: "https://storage.example.com/notices/18/facility_rules.pdf", contentType: "application/pdf", fileSize: 200000, createdAt: "2026-08-22T11:50:00" },
            { attachmentId: 44, originalFileName: "반납_체크리스트.pdf", storedFileName: "studio_return.pdf", fileUrl: "https://storage.example.com/notices/18/studio_return.pdf", contentType: "application/pdf", fileSize: 150000, createdAt: "2026-08-22T11:50:00" },
            { attachmentId: 45, originalFileName: "예약_변경안내.pdf", storedFileName: "booking_change.pdf", fileUrl: "https://storage.example.com/notices/18/booking_change.pdf", contentType: "application/pdf", fileSize: 120000, createdAt: "2026-08-22T11:50:00" },
            { attachmentId: 46, originalFileName: "촬영_준비목록.pdf", storedFileName: "shooting_checklist.pdf", fileUrl: "https://storage.example.com/notices/18/shooting_checklist.pdf", contentType: "application/pdf", fileSize: 140000, createdAt: "2026-08-22T11:50:00" },
            { attachmentId: 47, originalFileName: "예약_자주묻는질문.pdf", storedFileName: "booking_faq.pdf", fileUrl: "https://storage.example.com/notices/18/booking_faq.pdf", contentType: "application/pdf", fileSize: 260000, createdAt: "2026-08-22T11:50:00" },
            { attachmentId: 48, originalFileName: "문의_접수방법.pdf", storedFileName: "booking_contact.pdf", fileUrl: "https://storage.example.com/notices/18/booking_contact.pdf", contentType: "application/pdf", fileSize: 100000, createdAt: "2026-08-22T11:50:00" }
        ]
    },
    {
        noticeId: 19,
        authorId: 102,
        title: "배터리 충전재 및 액세서리 자율 반납함 설치 안내",
        content: "소형 액세서리 자율 반납함 이용 방법을 안내드립니다. 배터리, 케이블, 메모리카드와 같은 소형 물품은 운영시간 외에도 반납할 수 있습니다. 반납 전 물품명과 수량을 확인하고 지정된 칸에 넣어 주세요. ".repeat(102),
        viewCount: 145,
        important: false,
        createdAt: "2026-08-23T16:00:00",
        updatedAt: "2026-08-23T16:00:00",
        deletedAt: null,
        attachments: []
    },
    {
        noticeId: 20,
        authorId: 101,
        title: "2026년 2학기 상반기 장비 만족도 설문조사 실시",
        content: "더 나은 대여 서비스를 만들기 위한 이용자 만족도 조사를 진행합니다. 대여 신청부터 장비 수령과 반납까지 경험한 내용을 자유롭게 남겨 주세요. 응답 결과는 서비스 개선을 위한 자료로 활용되며 개인을 식별할 수 있는 정보는 별도로 수집하지 않습니다. ".repeat(5),
        viewCount: 75,
        important: false,
        createdAt: "2026-08-24T10:00:00",
        updatedAt: "2026-08-24T10:00:00",
        deletedAt: null,
        attachments: [
            {
                attachmentId: 9,
                originalFileName: "설문조사_참여안내.pdf",
                storedFileName: "20260824_survey_guide_g3h4i5j6.pdf",
                fileUrl: "https://storage.example.com/notices/20260824_survey_guide_g3h4i5j6.pdf",
                contentType: "application/pdf",
                fileSize: 450000,
                createdAt: "2026-08-24T10:00:00"
            },
            { attachmentId: 49, originalFileName: "설문_참여방법.pdf", storedFileName: "survey_howto.pdf", fileUrl: "https://storage.example.com/notices/20/survey_howto.pdf", contentType: "application/pdf", fileSize: 150000, createdAt: "2026-08-24T10:00:00" },
            { attachmentId: 50, originalFileName: "설문_문항안내.pdf", storedFileName: "survey_questions.pdf", fileUrl: "https://storage.example.com/notices/20/survey_questions.pdf", contentType: "application/pdf", fileSize: 180000, createdAt: "2026-08-24T10:00:00" },
            { attachmentId: 51, originalFileName: "응답_유의사항.pdf", storedFileName: "survey_notice.pdf", fileUrl: "https://storage.example.com/notices/20/survey_notice.pdf", contentType: "application/pdf", fileSize: 110000, createdAt: "2026-08-24T10:00:00" },
            { attachmentId: 52, originalFileName: "개선_의견서.pdf", storedFileName: "feedback_form.pdf", fileUrl: "https://storage.example.com/notices/20/feedback_form.pdf", contentType: "application/pdf", fileSize: 130000, createdAt: "2026-08-24T10:00:00" },
            { attachmentId: 53, originalFileName: "이벤트_일정표.pdf", storedFileName: "event_schedule.pdf", fileUrl: "https://storage.example.com/notices/20/event_schedule.pdf", contentType: "application/pdf", fileSize: 90000, createdAt: "2026-08-24T10:00:00" },
            { attachmentId: 54, originalFileName: "당첨자_발표안내.pdf", storedFileName: "winner_notice.pdf", fileUrl: "https://storage.example.com/notices/20/winner_notice.pdf", contentType: "application/pdf", fileSize: 160000, createdAt: "2026-08-24T10:00:00" },
            { attachmentId: 55, originalFileName: "경품_수령안내.pdf", storedFileName: "prize_info.pdf", fileUrl: "https://storage.example.com/notices/20/prize_info.pdf", contentType: "application/pdf", fileSize: 140000, createdAt: "2026-08-24T10:00:00" },
            { attachmentId: 56, originalFileName: "문의_안내.pdf", storedFileName: "survey_contact.pdf", fileUrl: "https://storage.example.com/notices/20/survey_contact.pdf", contentType: "application/pdf", fileSize: 100000, createdAt: "2026-08-24T10:00:00" },
            { attachmentId: 57, originalFileName: "개인정보_안내.pdf", storedFileName: "survey_privacy.pdf", fileUrl: "https://storage.example.com/notices/20/survey_privacy.pdf", contentType: "application/pdf", fileSize: 120000, createdAt: "2026-08-24T10:00:00" }
        ]
    }
];


