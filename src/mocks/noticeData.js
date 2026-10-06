const NOTICE_TITLES = [
  "[필독] 2026학년도 2학기 시스템 정기 점검 안내",
  "[안내] 기자재 대여 신청 및 반납 정책 변경 안내",
  "신규 촬영 장비 추가 도입 안내",
  "방학 기간 중 대여실 운영 시간 안내",
  "개인정보 처리방침 개정 안내",
  "기자재 파손 및 분실 시 보상 기준 안내",
  "시스템 업데이트 작업 완료 안내",
  "학생회·동아리 지원 장비 신청 안내",
  "만족도 조사 이벤트 당첨자 발표",
  "음향 및 조명 장비 반납 시 주의사항",
  "연휴 기간 기자재 대여실 휴무 안내",
  "삼각대 및 세트 보관함 위치 변경 안내",
  "무선 마이크 주파수 설정 주의사항",
  "촬영 스튜디오 예약 운영 안내",
  "장비 이용 전 안전교육 안내",
  "노트북 대여 가능 수량 변경 안내",
  "장기 대여 신청 서류 안내",
  "반납 지연 시 이용 제한 안내",
  "기자재 점검 일정 안내",
  "멀티미디어실 이용 만족도 조사 안내",
];

function createMockAttachment(noticeId, attachmentId) {
  return {
    attachmentId,
    originalFileName: `공지_${noticeId}_첨부파일.pdf`,
    contentType: "application/pdf",
    fileSize: 204800 + noticeId * 1024,
    downloadUrl: `/notices/${noticeId}/attachments/${attachmentId}/download`,
    createdAt: `2026-08-${String(noticeId).padStart(2, "0")}T09:00:00`,
  };
}

export const mockNotices = NOTICE_TITLES.map((title, index) => {
  const noticeId = index + 1;
  const hasAttachment = noticeId === 1 || noticeId % 4 === 0;

  return {
    noticeId,
    title,
    content: `${title}에 대한 상세 내용입니다. 이용 전에 공지 내용을 확인해 주세요.`,
    important: noticeId <= 2,
    authorId: 1,
    authorName: "관리자",
    createdAt: `2026-08-${String(noticeId).padStart(2, "0")}T09:00:00`,
    updatedAt: `2026-08-${String(noticeId).padStart(2, "0")}T09:00:00`,
    attachments: hasAttachment
      ? [createMockAttachment(noticeId, noticeId)]
      : [],
  };
});

export function getNextMockNoticeId() {
  return mockNotices.reduce(
    (largestId, notice) => Math.max(largestId, Number(notice.noticeId)),
    0,
  ) + 1;
}

export function getNextMockAttachmentId() {
  return mockNotices.reduce((largestId, notice) => {
    const noticeLargestId = notice.attachments.reduce(
      (currentLargestId, attachment) =>
        Math.max(currentLargestId, Number(attachment.attachmentId)),
      0,
    );

    return Math.max(largestId, noticeLargestId);
  }, 0) + 1;
}
