import { api } from "./client";

export const noticeKeys = {
  all: ["notices"],
  lists: () => ["notices", "list"],
  list: ({ important = null, page = 0, size = 10 } = {}) => [
    "notices",
    "list",
    { important, page, size },
  ],
  details: () => ["notices", "detail"],
  detail: (noticeId) => ["notices", "detail", String(noticeId)],
};

function normalizeAttachment(attachment) {
  return {
    attachmentId: attachment.attachmentId,
    originalFileName: attachment.originalFileName ?? "첨부파일",
    contentType: attachment.contentType ?? "application/octet-stream",
    fileSize: Number(attachment.fileSize ?? 0),
    downloadUrl: attachment.downloadUrl ?? null,
    createdAt: attachment.createdAt ?? null,
  };
}

function normalizeNoticeSummary(notice) {
  return {
    noticeId: notice.noticeId,
    title: notice.title ?? "",
    important: Boolean(notice.important),
    authorId: notice.authorId ?? null,
    authorName: notice.authorName ?? "",
    createdAt: notice.createdAt ?? null,
    // Swagger 목록 응답에 없는 값은 실제 데이터처럼 만들지 않아.
    summary: "",
    hasAttachment: null,
    viewCount: null,
  };
}

function normalizeNoticeDetail(notice) {
  const important = Boolean(notice?.important);

  return {
    noticeId: notice?.noticeId,
    title: notice?.title ?? "",
    content: notice?.content ?? "",
    important,
    isImportant: important,
    authorId: notice?.authorId ?? null,
    authorName: notice?.authorName ?? "",
    createdAt: notice?.createdAt ?? null,
    updatedAt: notice?.updatedAt ?? null,
    attachments: (notice?.attachments ?? []).map(normalizeAttachment),
    // Swagger 상세 응답에 없는 이전·다음 공지와 조회수는 미지원 상태로 둬.
    previousNotice: null,
    nextNotice: null,
    viewCount: null,
  };
}

function createNoticePath(noticeId) {
  return `/notices/${encodeURIComponent(String(noticeId))}`;
}

export async function fetchNotices({
  important,
  page = 0,
  size = 10,
  signal,
} = {}) {
  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (typeof important === "boolean") {
    searchParams.set("important", String(important));
  }

  const result = await api.get(`/notices?${searchParams.toString()}`, {
    signal,
  });

  return {
    content: (result?.notices ?? []).map(normalizeNoticeSummary),
    page: Number(result?.page ?? page),
    size: Number(result?.size ?? size),
    totalElements: Number(result?.totalElements ?? 0),
    totalPages: Number(result?.totalPages ?? 0),
    hasNext: Boolean(result?.hasNext),
    last: !result?.hasNext,
  };
}

export async function fetchNoticeDetail(noticeId, options) {
  const result = await api.get(createNoticePath(noticeId), options);
  return normalizeNoticeDetail(result);
}

export async function createNotice({ title, content, important }) {
  const result = await api.post("/notices", {
    title,
    content,
    important: Boolean(important),
  });

  return normalizeNoticeDetail(result);
}

export async function updateNotice(
  noticeId,
  { title, content, important },
) {
  const result = await api.patch(createNoticePath(noticeId), {
    title,
    content,
    important: Boolean(important),
  });

  return normalizeNoticeDetail(result);
}

export function deleteNotice(noticeId) {
  return api.del(createNoticePath(noticeId));
}

export async function uploadNoticeAttachment(noticeId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const result = await api.post(
    `${createNoticePath(noticeId)}/attachments`,
    formData,
  );

  return normalizeAttachment(result);
}

export class NoticeAttachmentUploadError extends Error {
  constructor({ uploadedAttachments, failedUploads }) {
    super(
      `첨부파일 ${failedUploads.length}개를 업로드하지 못했습니다. 다시 시도해 주세요.`,
    );
    this.name = "NoticeAttachmentUploadError";
    this.uploadedAttachments = uploadedAttachments;
    this.failedUploads = failedUploads;
    this.failedFiles = failedUploads.map(({ file }) => file);
  }
}

export async function uploadNoticeAttachments(noticeId, files = []) {
  const results = await Promise.allSettled(
    files.map((file) => uploadNoticeAttachment(noticeId, file)),
  );
  const uploadedAttachments = [];
  const failedUploads = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      uploadedAttachments.push(result.value);
      return;
    }

    failedUploads.push({
      file: files[index],
      error: result.reason,
    });
  });

  if (failedUploads.length > 0) {
    throw new NoticeAttachmentUploadError({
      uploadedAttachments,
      failedUploads,
    });
  }

  return uploadedAttachments;
}

export async function downloadNoticeAttachment(noticeId, attachment, options) {
  const blob = await api.get(
    `${createNoticePath(noticeId)}/attachments/${encodeURIComponent(
      String(attachment.attachmentId),
    )}/download`,
    { ...options, responseType: "blob" },
  );

  const objectUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = objectUrl;
  downloadLink.download = attachment.originalFileName || "첨부파일";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}
