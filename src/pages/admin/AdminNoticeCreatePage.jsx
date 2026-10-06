import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
  createNotice,
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
import styles from "./AdminNoticeCreatePage.module.css";

function getFileKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function AdminNoticeCreatePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const submitGuardRef = useRef(false);
  const createdNoticeIdRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    important: false,
  });
  const [files, setFiles] = useState([]);
  const isValid =
    form.title.trim().length > 0 &&
    form.title.trim().length <= 200 &&
    form.content.trim().length > 0;

  const createNoticeMutation = useMutation({
    mutationFn: async ({ noticePayload, attachmentFiles }) => {
      const notice = createdNoticeIdRef.current
        ? await updateNotice(createdNoticeIdRef.current, noticePayload)
        : await createNotice(noticePayload);

      try {
        const uploadedAttachments = await uploadNoticeAttachments(
          notice.noticeId,
          attachmentFiles,
        );

        return {
          ...notice,
          attachments: [...notice.attachments, ...uploadedAttachments],
        };
      } catch (error) {
        error.noticeId = notice.noticeId;
        throw error;
      }
    },
    onSuccess: (createdNotice) => {
      queryClient.setQueryData(
        noticeKeys.detail(createdNotice.noticeId),
        createdNotice,
      );
      queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
      navigate(`/admin/notices/${createdNotice.noticeId}`, { replace: true });
    },
    onError: (error) => {
      if (error?.noticeId) {
        createdNoticeIdRef.current = error.noticeId;
        queryClient.invalidateQueries({ queryKey: noticeKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: noticeKeys.detail(error.noticeId),
        });
      }

      if (error?.failedFiles) {
        setFiles(error.failedFiles);
      }
    },
  });

  function handleToggleImportant() {
    if (!createNoticeMutation.isPending) {
      setForm((currentForm) => ({
        ...currentForm,
        important: !currentForm.important,
      }));
      createNoticeMutation.reset();
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    createNoticeMutation.reset();
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
    createNoticeMutation.reset();
    event.target.value = "";
  }

  function handleRemoveFile(fileToRemove) {
    if (!createNoticeMutation.isPending) {
      setFiles((currentFiles) =>
        currentFiles.filter((file) => getFileKey(file) !== getFileKey(fileToRemove)),
      );
      createNoticeMutation.reset();
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isValid || createNoticeMutation.isPending || submitGuardRef.current) {
      return;
    }

    submitGuardRef.current = true;

    try {
      await createNoticeMutation.mutateAsync({
        noticePayload: {
          title: form.title.trim(),
          content: form.content.trim(),
          important: form.important,
        },
        attachmentFiles: files,
      });
    } catch {
      // 입력값과 업로드하지 못한 파일은 mutation 상태와 화면에 그대로 남겨.
    } finally {
      submitGuardRef.current = false;
    }
  }

  return (
    <form className={styles.noticeCreatePage} onSubmit={handleSubmit}>
      <PageHeader />

      <div className={styles.noticeCreateArea}>
        <div className={styles.createSection}>
          <p className={styles.sectionTitle}>공지 설정</p>
          <div>
            <ToggleButton
              status={form.important}
              onChange={handleToggleImportant}
            />
          </div>
        </div>

        <div className={styles.createSection}>
          <p className={styles.sectionTitle}>제목 *</p>
          <Input
            height="lg"
            width="fill"
            placeholder="제목을 입력하세요."
            id="title"
            name="title"
            value={form.title}
            disabled={createNoticeMutation.isPending}
            onChange={handleChange}
          />
        </div>

        <div className={styles.createSection}>
          <p className={styles.sectionTitle}>내용 *</p>
          <Textarea
            placeholder="내용을 입력하세요."
            width="100%"
            height="auto"
            id="content"
            name="content"
            value={form.content}
            disabled={createNoticeMutation.isPending}
            onChange={handleChange}
          />
        </div>

        <div className={styles.createSection}>
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
              disabled={createNoticeMutation.isPending}
              onClick={() => fileInputRef.current?.click()}
            />

            <div className={styles.attachmentsWrapper}>
              {files.map((file) => (
                <AttachmentItem
                  key={getFileKey(file)}
                  icon="trash"
                  attachment={file}
                  disabled={createNoticeMutation.isPending}
                  onClick={() => handleRemoveFile(file)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {createNoticeMutation.error ? (
        <p className={styles.errorMessage} role="alert">
          {createNoticeMutation.error.message || "공지사항을 작성하지 못했습니다."}
        </p>
      ) : null}

      <div className={styles.buttonWrapper}>
        <Button
          color="Neutral"
          kind="border"
          size="Default"
          status="Default"
          text="돌아가기"
          disabled={createNoticeMutation.isPending}
          onClick={() => navigate("/admin/notices")}
        />
        <Button
          color="Primary"
          kind="fill"
          size="Default"
          status="Default"
          text={createNoticeMutation.isPending ? "작성 중" : "작성 완료"}
          type="submit"
          disabled={!isValid || createNoticeMutation.isPending}
        />
      </div>
    </form>
  );
}

export default AdminNoticeCreatePage;
