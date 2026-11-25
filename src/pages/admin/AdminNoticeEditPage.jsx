import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import {
  downloadNoticeAttachment,
  fetchNoticeDetail,
  noticeKeys,
  updateNotice,
  uploadNoticeAttachments,
} from "../../api/noticeApi";
import AttachmentItem from "../../components/common/AttachmentItem";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import ToggleButton from "../../components/common/ToggleButton";
import PageHeader from "../../components/layout/PageHeader";
import styles from "./AdminNoticeEditPage.module.css";

function getFileKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function AdminNoticeEditForm({ noticeData }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const submitGuardRef = useRef(false);
  const downloadGuardRef = useRef(new Set());
  const [form, setForm] = useState({
    title: noticeData.title,
    content: noticeData.content,
    important: noticeData.important,
  });
  const [files, setFiles] = useState([]);
  const [downloadingAttachmentIds, setDownloadingAttachmentIds] = useState(
    () => new Set(),
  );
  const [downloadError, setDownloadError] = useState("");
  const isValid =
    form.title.trim().length > 0 &&
    form.title.trim().length <= 200 &&
    form.content.trim().length > 0;

  const updateNoticeMutation = useMutation({
    mutationFn: async ({ noticePayload, attachmentFiles }) => {
      const updatedNotice = await updateNotice(
        noticeData.noticeId,
        noticePayload,
      );

      try {
        const uploadedAttachments = await uploadNoticeAttachments(
          noticeData.noticeId,
          attachmentFiles,
        );

        return {
          ...updatedNotice,
          attachments: [
            ...updatedNotice.attachments,
            ...uploadedAttachments,
          ],
        };
      } catch (error) {
        error.noticeId = noticeData.noticeId;
        throw error;
      }
    },
    onSuccess: (updatedNotice) => {
      queryClient.setQueryData(
        noticeKeys.detail(updatedNotice.noticeId),
        updatedNotice,
      );
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
      navigate(`/admin/notices/${updatedNotice.noticeId}`, { replace: true });
    },
    onError: (error) => {
      if (error?.noticeId) {
        queryClient.invalidateQueries({
          queryKey: noticeKeys.detail(error.noticeId),
        });
      }

      if (error?.failedFiles) {
        setFiles(error.failedFiles);
      }
    },
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    updateNoticeMutation.reset();
  }

  function handleToggleImportant() {
    if (!updateNoticeMutation.isPending) {
      setForm((currentForm) => ({
        ...currentForm,
        important: !currentForm.important,
      }));
      updateNoticeMutation.reset();
    }
  }

  function handleFilesSelected(event) {
    const selectedFiles = Array.from(event.target.files ?? []);

    setFiles((currentFiles) => {
      const fileKeys = new Set(currentFiles.map(getFileKey));
      return [
        ...currentFiles,
        ...selectedFiles.filter((file) => !fileKeys.has(getFileKey(file))),
      ];
    });
    updateNoticeMutation.reset();
    event.target.value = "";
  }

  function handleRemoveFile(fileToRemove) {
    if (!updateNoticeMutation.isPending) {
      setFiles((currentFiles) =>
        currentFiles.filter(
          (file) => getFileKey(file) !== getFileKey(fileToRemove),
        ),
      );
      updateNoticeMutation.reset();
    }
  }

  async function handleDownloadAttachment(attachment) {
    const attachmentId = String(attachment.attachmentId);

    if (downloadGuardRef.current.has(attachmentId)) {
      return;
    }

    downloadGuardRef.current.add(attachmentId);
    setDownloadingAttachmentIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(attachmentId);
      return nextIds;
    });
    setDownloadError("");

    try {
      await downloadNoticeAttachment(noticeData.noticeId, attachment);
    } catch (error) {
      setDownloadError(
        error?.message || "첨부파일을 다운로드하지 못했습니다.",
      );
    } finally {
      downloadGuardRef.current.delete(attachmentId);
      setDownloadingAttachmentIds((currentIds) => {
        const nextIds = new Set(currentIds);
        nextIds.delete(attachmentId);
        return nextIds;
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isValid || updateNoticeMutation.isPending || submitGuardRef.current) {
      return;
    }

    submitGuardRef.current = true;

    try {
      await updateNoticeMutation.mutateAsync({
        noticePayload: {
          title: form.title.trim(),
          content: form.content.trim(),
          important: form.important,
        },
        attachmentFiles: files,
      });
    } catch {
      // 입력값과 업로드하지 못한 파일을 mutation 상태와 화면에 그대로 유지함.
    } finally {
      submitGuardRef.current = false;
    }
  }

  return (
    <form className={styles.noticeCreatePage} onSubmit={handleSubmit}>
      <PageHeader />

      <div className={styles.noticeEditArea}>
        <div className={styles.editSection}>
          <p className={styles.sectionTitle}>공지 설정</p>
          <div>
            <ToggleButton
              status={form.important}
              onChange={handleToggleImportant}
            />
          </div>
        </div>

        <div className={styles.editSection}>
          <p className={styles.sectionTitle}>제목 *</p>
          <Input
            height="lg"
            width="fill"
            placeholder="제목을 입력하세요."
            id="title"
            name="title"
            value={form.title}
            disabled={updateNoticeMutation.isPending}
            onChange={handleChange}
          />
        </div>

        <div className={styles.editSection}>
          <p className={styles.sectionTitle}>내용 *</p>
          <Textarea
            placeholder="내용을 입력하세요."
            width="100%"
            height="auto"
            id="content"
            name="content"
            value={form.content}
            disabled={updateNoticeMutation.isPending}
            onChange={handleChange}
          />
        </div>

        <div className={styles.editSection}>
          <p className={styles.sectionTitle}>첨부파일</p>
          <div className={styles.attachmentsArea}>
            <input
              ref={fileInputRef}
              className={styles.hiddenFileInput}
              type="file"
              multiple
              onChange={handleFilesSelected}
            />
            <Button
              color="Neutral"
              kind="border"
              showLeftIcon
              size="Default"
              status="Default"
              text="파일 선택"
              disabled={updateNoticeMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
            />

            <div className={styles.attachmentsWrapper}>
              {noticeData.attachments.map((attachment) => (
                <AttachmentItem
                  key={attachment.attachmentId}
                  icon="download"
                  attachment={attachment}
                  disabled={
                    updateNoticeMutation.isPending ||
                    downloadingAttachmentIds.has(String(attachment.attachmentId))
                  }
                  onClick={() => handleDownloadAttachment(attachment)}
                />
              ))}
              {files.map((file) => (
                <AttachmentItem
                  key={getFileKey(file)}
                  icon="trash"
                  attachment={file}
                  disabled={updateNoticeMutation.isPending}
                  onClick={() => handleRemoveFile(file)}
                />
              ))}
            </div>
            <p className={styles.attachmentHint}>
              기존 첨부파일은 삭제할 수 없습니다.
            </p>
          </div>
        </div>
      </div>

      {updateNoticeMutation.error ? (
        <p className={styles.errorMessage} role="alert">
          {updateNoticeMutation.error.message ||
            "공지사항을 수정하지 못했습니다."}
        </p>
      ) : null}

      {downloadError ? (
        <p className={styles.errorMessage} role="alert">
          {downloadError}
        </p>
      ) : null}

      <div className={styles.buttonWrapper}>
        <Button
          color="Neutral"
          kind="border"
          size="Default"
          status="Default"
          text="돌아가기"
          disabled={updateNoticeMutation.isPending}
          onClick={() => navigate(`/admin/notices/${noticeData.noticeId}`)}
        />
        <Button
          color="Primary"
          kind="fill"
          size="Default"
          status="Default"
          text={updateNoticeMutation.isPending ? "수정 중" : "수정 완료"}
          type="submit"
          disabled={!isValid || updateNoticeMutation.isPending}
        />
      </div>
    </form>
  );
}

function AdminNoticeEditPage() {
  const { noticeId } = useParams();
  const noticeQuery = useQuery({
    queryKey: noticeKeys.detail(noticeId),
    queryFn: ({ signal }) => fetchNoticeDetail(noticeId, { signal }),
    enabled: Boolean(noticeId),
  });

  if (noticeQuery.isPending) {
    return (
      <div className={styles.noticeCreatePage}>
        <PageHeader />
        <p className={styles.stateMessage}>공지사항을 불러오는 중입니다.</p>
      </div>
    );
  }

  if (noticeQuery.isError || !noticeQuery.data) {
    return (
      <div className={styles.noticeCreatePage}>
        <PageHeader />
        <div className={styles.stateMessage}>
          <p role="alert">
            {noticeQuery.error?.message || "공지사항을 불러오지 못했습니다."}
          </p>
          <Button
            color="Neutral"
            kind="border"
            size="Default"
            status="Default"
            text="다시 시도"
            onClick={() => noticeQuery.refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <AdminNoticeEditForm
      key={noticeQuery.data.noticeId}
      noticeData={noticeQuery.data}
    />
  );
}

export default AdminNoticeEditPage;
