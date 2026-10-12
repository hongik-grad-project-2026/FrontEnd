import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBeforeUnload, useBlocker, useNavigate } from "react-router-dom";
import {
  getStudentRentalCounts,
  studentRentalKeys,
} from "../../api/rentalApi";

import DashboardStatusCard from "../../components/card/DashboardStatusCard";
import Button from "../../components/common/Button";
import InputBar from "../../components/common/Input";
import PageHeader from "../../components/layout/PageHeader";
import ConfirmModal from "../../components/modal/ConfirmModal";
import { useUser } from "../../context/UserContext";
import styles from "./StudentMyPage.module.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^01[016789][0-9]{7,8}$/;
const DEFAULT_PROFILE_IMAGE = "/images/hongikLogo-circle.png";
const MY_INFO_FIELDS = [
  "email",
  "phoneNumber",
  "studentId",
  "college",
  "department",
];

function hasCompleteMyInfo(candidate) {
  return MY_INFO_FIELDS.every((field) => Object.hasOwn(candidate ?? {}, field));
}

function ReadOnlyField({ label, value }) {
  return (
    <div className={styles.readOnlyField}>
      <span className={styles.fieldLabel}>{label}</span>
      <strong className={styles.fieldValue}>{value || "-"}</strong>
    </div>
  );
}

function StudentMyPage() {
  const navigate = useNavigate();
  const {
    user,
    refreshCurrentUser,
    updateMyInfo,
    updateMyProfileImage,
    withdrawCurrentUser,
  } = useUser();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(user?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageSelectionError, setImageSelectionError] = useState("");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const imageInputRef = useRef(null);
  const previewUrlRef = useRef("");
  const infoSubmitGuardRef = useRef(false);
  const imageSubmitGuardRef = useRef(false);
  const withdrawGuardRef = useRef(false);
  const infoDirtyRef = useRef(false);
  const bypassNavigationGuardRef = useRef(false);
  const currentUserQueryKey = ["currentUser", user?.id];
  const hasHydratedUser = hasCompleteMyInfo(user);

  const currentUserQuery = useQuery({
    queryKey: currentUserQueryKey,
    queryFn: ({ signal }) => refreshCurrentUser({ signal }),
    enabled: !hasHydratedUser,
    initialData: hasHydratedUser ? user : undefined,
  });
  const infoMutation = useMutation({ mutationFn: updateMyInfo });
  const imageMutation = useMutation({ mutationFn: updateMyProfileImage });
  const withdrawMutation = useMutation({ mutationFn: withdrawCurrentUser });
  const rentalCountsQuery = useQuery({
    queryKey: studentRentalKeys.counts(),
    queryFn: ({ signal }) => getStudentRentalCounts({ signal }),
    retry: (failureCount, error) =>
      error?.code !== "STUDENT_RENTAL_API_UNAVAILABLE" && failureCount < 1,
  });
  const rentalCounts = rentalCountsQuery.data;
  const rentalApplicationCount = rentalCounts?.approvalPending ?? "-";
  const activeRentalCount = rentalCounts
    ? rentalCounts.pickupPending + rentalCounts.renting
    : "-";
  const returnedRentalCount = rentalCounts?.returned ?? "-";

  function releasePreviewUrl() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
  }

  useEffect(() => {
    return () => {
      releasePreviewUrl();
    };
  }, []);

  useEffect(() => {
    if (!currentUserQuery.data || infoDirtyRef.current) {
      return;
    }

    setEmail(currentUserQuery.data.email ?? "");
    setPhoneNumber(currentUserQuery.data.phoneNumber ?? "");
  }, [currentUserQuery.data]);

  const availableUser = hasHydratedUser
    ? user
    : (hasCompleteMyInfo(currentUserQuery.data)
      ? currentUserQuery.data
      : null);
  const isMyInfoLoading =
    availableUser === null &&
    (currentUserQuery.isPending || currentUserQuery.isFetching);
  const isMyInfoUnavailable = availableUser === null && !isMyInfoLoading;
  const displayedEmail = infoDirtyRef.current
    ? email
    : (availableUser?.email ?? email);
  const displayedPhoneNumber = infoDirtyRef.current
    ? phoneNumber
    : (availableUser?.phoneNumber ?? phoneNumber);
  const trimmedEmail = displayedEmail.trim();
  const trimmedPhoneNumber = displayedPhoneNumber.trim();
  const isEmailValid = EMAIL_PATTERN.test(trimmedEmail);
  const isPhoneNumberValid = PHONE_PATTERN.test(trimmedPhoneNumber);
  const hasInfoChanges =
    trimmedEmail !== (availableUser?.email ?? "") ||
    trimmedPhoneNumber !== (availableUser?.phoneNumber ?? "");
  const hasUnsavedChanges = hasInfoChanges || selectedImage !== null;
  const canSubmitInfo =
    hasInfoChanges &&
    isEmailValid &&
    isPhoneNumberValid &&
    !infoMutation.isPending;
  const profileImageSrc =
    previewUrl || availableUser?.profileImageUrl || DEFAULT_PROFILE_IMAGE;

  const shouldBlockNavigation = useCallback(
    ({ currentLocation, nextLocation }) =>
      !bypassNavigationGuardRef.current &&
      hasUnsavedChanges &&
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search ||
        currentLocation.hash !== nextLocation.hash),
    [hasUnsavedChanges],
  );
  const navigationBlocker = useBlocker(shouldBlockNavigation);

  useBeforeUnload(
    useCallback(
      (event) => {
        if (
          !hasUnsavedChanges ||
          bypassNavigationGuardRef.current
        ) {
          return;
        }

        event.preventDefault();
        event.returnValue = "";
      },
      [hasUnsavedChanges],
    ),
    { capture: true },
  );

  async function handleInfoSubmit(event) {
    event.preventDefault();

    if (!canSubmitInfo || infoSubmitGuardRef.current) {
      return;
    }

    infoSubmitGuardRef.current = true;

    try {
      const updatedUser = await infoMutation.mutateAsync({
        email: trimmedEmail,
        phoneNumber: trimmedPhoneNumber,
      });

      infoDirtyRef.current = false;
      setEmail(updatedUser.email ?? "");
      setPhoneNumber(updatedUser.phoneNumber ?? "");
      queryClient.setQueryData(currentUserQueryKey, updatedUser);
    } catch {
      // 오류 내용은 mutation 상태로 화면에 표시함.
    } finally {
      infoSubmitGuardRef.current = false;
    }
  }

  function handleImageChange(event) {
    const image = event.target.files?.[0] ?? null;

    if (!image) {
      return;
    }

    if (!image.type.startsWith("image/")) {
      setImageSelectionError("이미지 파일만 선택할 수 있습니다.");
      event.target.value = "";
      return;
    }

    releasePreviewUrl();
    const nextPreviewUrl = URL.createObjectURL(image);
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
    setSelectedImage(image);
    setImageSelectionError("");
    imageMutation.reset();
  }

  async function handleImageSubmit() {
    if (!selectedImage || imageMutation.isPending || imageSubmitGuardRef.current) {
      return;
    }

    imageSubmitGuardRef.current = true;

    try {
      const updatedUser = await imageMutation.mutateAsync(selectedImage);
      queryClient.setQueryData(currentUserQueryKey, updatedUser);
      releasePreviewUrl();
      setPreviewUrl("");
      setSelectedImage(null);

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    } catch {
      // 실패 시 선택한 파일과 미리보기를 그대로 유지함.
    } finally {
      imageSubmitGuardRef.current = false;
    }
  }

  function handleCloseWithdrawModal() {
    if (!withdrawMutation.isPending) {
      setIsWithdrawModalOpen(false);
      withdrawMutation.reset();
    }
  }

  async function handleWithdraw() {
    if (withdrawMutation.isPending || withdrawGuardRef.current) {
      return;
    }

    withdrawGuardRef.current = true;

    try {
      await withdrawMutation.mutateAsync();
      queryClient.removeQueries({ queryKey: ["currentUser"] });
      bypassNavigationGuardRef.current = true;
      navigate("/login", { replace: true });
    } catch {
      // 실패 시 확인창을 유지해 서버 오류를 표시함.
    } finally {
      withdrawGuardRef.current = false;
    }
  }

  return (
    <div className={styles.studentMyPage}>
      <PageHeader />

      <div className={styles.contentSection}>
        <h3>기본 정보</h3>

        {isMyInfoLoading ? (
          <div className={styles.myInfoState} role="status">
            <p>내 정보를 불러오는 중입니다.</p>
          </div>
        ) : isMyInfoUnavailable ? (
          <div className={styles.myInfoState} role="alert">
            <p>
              {currentUserQuery.error?.message || "내 정보를 불러오지 못했습니다."}
            </p>
            <Button
              color="Primary"
              kind="border"
              size="Default"
              status="Default"
              text={currentUserQuery.isFetching ? "다시 시도 중" : "다시 시도"}
              disabled={currentUserQuery.isFetching}
              onClick={() => currentUserQuery.refetch()}
            />
          </div>
        ) : (
        <div className={styles.profileCard}>
          <div className={styles.profileArea}>
            <img
              className={styles.profileImage}
              src={profileImageSrc}
              alt={`${availableUser?.name ?? "사용자"} 프로필`}
            />

            <input
              ref={imageInputRef}
              className={styles.hiddenFileInput}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />

            <Button
              color="Neutral"
              kind="border"
              size="Default"
              status="Default"
              text="사진 선택"
              disabled={imageMutation.isPending}
              onClick={() => imageInputRef.current?.click()}
            />
            <Button
              color="Primary"
              kind="fill"
              size="Default"
              status="Default"
              text={imageMutation.isPending ? "저장 중" : "사진 저장"}
              disabled={!selectedImage || imageMutation.isPending}
              onClick={handleImageSubmit}
            />

            {imageSelectionError || imageMutation.error ? (
              <p className={styles.errorMessage} role="alert">
                {imageSelectionError ||
                  imageMutation.error?.message ||
                  "프로필 사진을 변경하지 못했습니다."}
              </p>
            ) : null}
          </div>

          <div className={styles.profileContent}>
            <div className={styles.readOnlyGrid}>
              <ReadOnlyField label="이름" value={availableUser?.name} />
              <ReadOnlyField
                label="학번"
                value={availableUser?.studentId ?? availableUser?.loginId}
              />
              <ReadOnlyField label="단과대학" value={availableUser?.college} />
              <ReadOnlyField label="학과" value={availableUser?.department} />
            </div>

            <form className={styles.editForm} onSubmit={handleInfoSubmit} noValidate>
              <div className={styles.editField}>
                <label className={styles.fieldLabel} htmlFor="mypage-email">
                  이메일
                </label>
                <InputBar
                  id="mypage-email"
                  name="email"
                  type="email"
                  width="100%"
                  value={displayedEmail}
                  helperText={
                    email !== "" && !isEmailValid
                      ? "이메일 형식을 확인해 주세요."
                      : undefined
                  }
                  disabled={infoMutation.isPending}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    infoDirtyRef.current = true;
                    infoMutation.reset();
                  }}
                />
              </div>

              <div className={styles.editField}>
                <label className={styles.fieldLabel} htmlFor="mypage-phone-number">
                  연락처
                </label>
                <InputBar
                  id="mypage-phone-number"
                  name="phoneNumber"
                  type="tel"
                  width="100%"
                  value={displayedPhoneNumber}
                  helperText={
                    phoneNumber !== "" && !isPhoneNumberValid
                      ? "전화번호는 '-' 없이 입력해 주세요."
                      : undefined
                  }
                  disabled={infoMutation.isPending}
                  onChange={(event) => {
                    setPhoneNumber(event.target.value);
                    infoDirtyRef.current = true;
                    infoMutation.reset();
                  }}
                />
              </div>

              <div className={styles.editActions}>
                <Button
                  color="Primary"
                  kind="fill"
                  size="Default"
                  status="Default"
                  type="submit"
                  text={infoMutation.isPending ? "저장 중" : "연락처 정보 저장"}
                  disabled={!canSubmitInfo}
                />
              </div>

              {infoMutation.error ? (
                <p className={styles.errorMessage} role="alert">
                  {infoMutation.error.message || "내 정보를 수정하지 못했습니다."}
                </p>
              ) : null}

            </form>
          </div>
        </div>
        )}
      </div>

      <div className={styles.contentSection}>
        <h3>대여 현황</h3>
        {rentalCountsQuery.isError ? (
          <p className={styles.rentalCountState} role="status">
            {rentalCountsQuery.error?.code === "STUDENT_RENTAL_API_UNAVAILABLE"
              ? "대여 API가 아직 제공되지 않았습니다."
              : "대여 현황을 불러오지 못했습니다."}
          </p>
        ) : null}
        <div className={styles.contentContainer}>
          <DashboardStatusCard
            title="대여 신청"
            count={rentalApplicationCount}
            onClick={() => navigate("/student/history")}
            color="yellow"
          />
          <DashboardStatusCard
            title="대여 중"
            count={activeRentalCount}
            onClick={() => navigate("/student/history")}
            color="green"
          />
          <DashboardStatusCard
            title="반납 완료"
            count={returnedRentalCount}
            onClick={() => navigate("/student/history")}
            color="red"
          />
        </div>
      </div>

      <div className={styles.contentSection}>
        <h3>이용 안내 및 기타</h3>
        <div className={styles.contentContainer}>
          <Button color="Primary" kind="border" size="Default" status="Default"
            text="MULMI 이용방법" className={styles.infoButton}
          />
          <Button color="Primary" kind="border" size="Default" status="Default"
            text="MULMI 이용규칙" className={styles.infoButton}
          />
          <Button color="Primary" kind="border" size="Default" status="Default"
            text="서비스 이용 약관" className={styles.infoButton}
          />
          <Button color="Primary" kind="border" size="Default" status="Default"
            text="개인정보 처리방침" className={styles.infoButton}
          />
          <Button color="Primary" kind="border" size="Default" status="Default"
            text="서약서 내용 확인" className={styles.infoButton}
          />
          <Button color="Primary" kind="border" size="Default" status="Default"
            text="회원 탈퇴" className={styles.infoButton}
            onClick={() => setIsWithdrawModalOpen(true)}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={navigationBlocker.state === "blocked"}
        icon="warning"
        title="저장하지 않은 변경이 있습니다."
        description="이 페이지를 나가면 저장하지 않은 이메일·연락처 또는 프로필 이미지 변경이 사라집니다."
        cancelText="계속 작성"
        confirmText="나가기"
        confirmColor="Danger"
        onClose={() => navigationBlocker.reset?.()}
        onConfirm={() => navigationBlocker.proceed?.()}
      />

      <ConfirmModal
        isOpen={isWithdrawModalOpen}
        icon="warning"
        title="회원 탈퇴"
        description="탈퇴하면 현재 계정으로 더 이상 서비스를 이용할 수 없습니다."
        secondaryDescription={
          withdrawMutation.error
            ? withdrawMutation.error.message || "회원 탈퇴에 실패했습니다."
            : "정말 탈퇴하시겠습니까?"
        }
        cancelText="취소"
        confirmText={withdrawMutation.isPending ? "처리 중" : "회원 탈퇴"}
        confirmColor="Danger"
        actionsDisabled={withdrawMutation.isPending}
        closeOnEscape={!withdrawMutation.isPending}
        closeOnOverlay={!withdrawMutation.isPending}
        onClose={handleCloseWithdrawModal}
        onConfirm={handleWithdraw}
      />
    </div>
  );
}

export default StudentMyPage;
