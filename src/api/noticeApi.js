// 임시 API
export async function fetchNotices({ page = 0, size = 10 }) {

    // 중요 공지 우선
    const sortedNotices = [...MOCK_NOTICES].sort(
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
    const content = sortedNotices.slice(startIndex, endIndex);
    return {
        content,                                // 현재 페이지에 해당하는 공지사항 데이터 배열
        page,                                   // 현재 페이지 번호
        size,                                   // 한 페이지당 요청한 데이터 개수
        totalElements: MOCK_NOTICES.length,     // 전체 공지사항 데이터 총 개수
        totalPages: Math.ceil(MOCK_NOTICES.length / size), // 전체 페이지 수 (전체 개수 / 페이지 크기 올림)
        last: endIndex >= MOCK_NOTICES.length,  // 마지막 페이지 여부 (더 이상 불러올 데이터가 없으면 true)
    };
}

// 임시 목업 데이터 20개
export const MOCK_NOTICES = [
    {
        noticeId: 1,
        authorId: 101,
        title: "[필독] 2026학년도 2학기 시스템 정기 점검 안내",
        content: "안녕하세요. 시스템 관리자입니다. 서비스 안정화를 위한 정기 점검이 진행될 예정입니다. 점검 시간 동안 서비스 이용이 일시 중단되오니 양해 부탁드립니다. 안녕하세요. 시스템 관리자입니다. 서비스 안정화를 위한 정기 점검이 진행될 예정입니다. 점검 시간 동안 서비스 이용이 일시 중단되오니 양해 부탁드립니다. 안녕하세요. 시스템 관리자입니다. 서비스 안정화를 위한 정기 점검이 진행될 예정입니다. 점검 시간 동안 서비스 이용이 일시 중단되오니 양해 부탁드립니다.",
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
        content: "기자재 대여 및 반납 절차가 일부 변경되었습니다. 자세한 내용은 첨부된 가이드라인 문서를 확인해 주시기 바랍니다.",
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
            }
        ]
    },
    {
        noticeId: 3,
        authorId: 102,
        title: "신규 촬영 장비(Sony A7M4) 추가 도입 안내",
        content: "신규 대여 장비로 Sony A7M4 카메라 세트 5대가 추가되었습니다. 대여 현황 페이지에서 신청 가능합니다.",
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
        content: "방학 기간 동안 대여실 운영 시간이 평일 10:00 ~ 17:00로 단축 운영됩니다. 주말 및 공휴일은 휴무입니다.",
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
        content: "개인정보 보호법 개정에 따라 서비스 개인정보 처리방침이 일부 변경될 예정입니다.",
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
        content: "대여 장비 파손 및 분실 발생 시 처리 절차와 수리비 청구 기준에 대한 안내입니다.",
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
            }
        ]
    },
    {
        noticeId: 7,
        authorId: 103,
        title: "연동 시스템 업데이트 작업에 따른 일시 오류 조치 완료",
        content: "금일 오전 발생한 서버 응답 지연 문제가 정상 조치되었습니다. 이용에 불편을 드려 죄송합니다.",
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
        content: "동아리 행사를 위한 장비 장기 대여 신청을 받습니다. 첨부된 신청서를 작성하여 제출해 주세요.",
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
            }
        ]
    },
    {
        noticeId: 9,
        authorId: 102,
        title: "[임시] 삭제된 테스트용 공지사항",
        content: "이 공지사항은 관리자에 의해 삭제 처리된 항목입니다.",
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
        content: "만족도 조사에 참여해 주신 모든 분들께 감사드립니다. 당첨자 명단은 첨부파일을 확인해 주세요.",
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
            }
        ]
    },
    {
        noticeId: 11,
        authorId: 103,
        title: "음향 및 조명 장비 반납 시 주의사항 안내",
        content: "음향 케이블 및 조명 케이스 수량 미달 반납이 빈번히 발생하고 있습니다. 반납 전 구성품을 재확인해 주세요.",
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
        content: "추석 연휴 기간 동안 대여실 운영이 일시 중단됩니다. 연휴 전 반납 기한을 엄수해 주시기 바랍니다.",
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
        content: "대여실 내부 구조 변경에 따라 삼각대 보관함 위치가 A구역에서 C구역으로 변경되었습니다.",
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
            }
        ]
    },
    {
        noticeId: 14,
        authorId: 103,
        title: "무선 마이크 주파수 채널 설정 관련 주의사항",
        content: "다른 촬영팀과의 주파수 혼선 방지를 위해 사용 전 권장 채널표를 참고하여 설정해 주세요.",
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
        content: "내구연한이 만료된 일부 노후 카메라 기종이 대여 목록에서 제외됩니다.",
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
        content: "서비스 회원 이용 약관이 일부 개정될 예정입니다. 변경사항은 첨부파일을 참고해 주세요.",
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
            }
        ]
    },
    {
        noticeId: 17,
        authorId: 103,
        title: "대여 연체 보상금 제도 정식 시행 안내",
        content: "반납 시각 미준수로 인한 타 유저의 피해를 방지하고자, 연체 시 대여 제한 일수가 부여됩니다.",
        viewCount: 510,
        important: true,
        createdAt: "2026-08-21T14:15:00",
        updatedAt: "2026-08-21T14:15:00",
        deletedAt: null,
        attachments: []
    },
    {
        noticeId: 18,
        authorId: 101,
        title: "스튜디오 대관 및 장비 동시 신청 기능 오픈",
        content: "스튜디오 예약 시 필요한 대여 장비를 한 번에 선택하여 신청할 수 있는 신규 기능이 도입되었습니다.",
        viewCount: 340,
        important: false,
        createdAt: "2026-08-22T11:50:00",
        updatedAt: "2026-08-22T11:50:00",
        deletedAt: null,
        attachments: []
    },
    {
        noticeId: 19,
        authorId: 102,
        title: "배터리 충전재 및 액세서리 자율 반납함 설치 안내",
        content: "소형 액세서리류는 운영시간 외에도 자율 반납함에 반납이 가능합니다.",
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
        content: "더 나은 대여 서비스 제공을 위해 만족도 조사를 진행합니다. 많은 참여 부탁드립니다.",
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
            }
        ]
    }
];


