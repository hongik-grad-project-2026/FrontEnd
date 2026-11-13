// 모델 등록 모달임.
import { useId, useRef, useState } from "react";
import Button from "../common/Button";
import IconButton, { IconTextButton } from "../common/IconButton";
import InputBar from "../common/Input";
import Select from "../common/Select";
import BaseModal from "./BaseModal";
import ConfirmModal from "./ConfirmModal";
import styles from "./EquipmentCreateModal.module.css";

const STATUS_OPTIONS = [
  {
    value: "active",
    label: "대여 진행",
  },
  {
    value: "paused",
    label: "대여 중지",
  },
];

const RENTAL_POLICY_OPTIONS = [
  { value: "regular", label: "정기" },
  { value: "always", label: "상시" },
];

const FLEXIBLE_POLICY_CATEGORY_LABELS = new Set(["노트북", "태블릿"]);

function allowsFlexibleRentalPolicies(categoryOption) {
  return FLEXIBLE_POLICY_CATEGORY_LABELS.has(categoryOption?.label);
}

function isOtherCategory(categoryOption) {
  return (
    typeof categoryOption?.label === "string" &&
    categoryOption.label.trim() === "기타"
  );
}

function createEmptyForm() {
  return {
    category: "",
    status: "",
    rentalPolicies: "",
    receivedDate: null,
    disposalDate: null,
    name: "",
    accessories: "",
    specification: "",
    description: "",
    labelPrefix: "",
    imageFile: null,
  };
}

function isValidDate(value) {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function formatFileSize(size) {
  if (!Number.isFinite(size) || size < 0) {
    return "";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  const kilobytes = size / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

function EquipmentCreateModal({
  categoryOptions = [],
  isOpen = false,
  isMetadataLocked = false,
  isPending = false,
  onClose,
  onConfirm,
  returnFocusRef,
}) {
  const generatedId = useId();
  const fileInputRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const submitGuardRef = useRef(false);

  const [formValues, setFormValues] = useState(createEmptyForm);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const titleId = `${generatedId}-title`;
  const categoryId = `${generatedId}-category`;
  const statusId = `${generatedId}-status`;
  const receivedDateId = `${generatedId}-received-date`;
  const disposalDateId = `${generatedId}-disposal-date`;
  const nameId = `${generatedId}-name`;
  const accessoriesId = `${generatedId}-accessories`;
  const specificationId = `${generatedId}-specification`;
  const descriptionId = `${generatedId}-description`;
  const labelPrefixId = `${generatedId}-label-prefix`;
  const imageFileId = `${generatedId}-image-file`;

  const selectedCategoryOption = categoryOptions.find(
    (option) => option.value === formValues.category,
  );

  const isOtherCategorySelected = isOtherCategory(selectedCategoryOption);
  const metadataInputsDisabled = isPending || isMetadataLocked;

  const isRequiredFormComplete =
    Boolean(formValues.category) &&
    Boolean(formValues.status) &&
    Boolean(formValues.rentalPolicies) &&
    isValidDate(formValues.receivedDate) &&
    isValidDate(formValues.disposalDate) &&
    Boolean(formValues.name.trim()) &&
    Boolean(formValues.accessories.trim()) &&
    (isOtherCategorySelected || Boolean(formValues.labelPrefix.trim())) &&
    formValues.imageFile !== null;

  const updateFormValue = (field, value) => {
    if (isPending || (isMetadataLocked && field !== "imageFile")) {
      return;
    }

    setFormValues((previousValues) => ({
      ...previousValues,
      [field]: value,
    }));
  };

  const handleTextChange = (field) => (event) => {
    updateFormValue(field, event.target.value);
  };

  const handleCategoryChange = (nextCategory) => {
    if (metadataInputsDisabled) {
      return;
    }

    const nextCategoryOption = categoryOptions.find(
      (option) => option.value === nextCategory,
    );
    const nextAllowsFlexiblePolicies = allowsFlexibleRentalPolicies(
      nextCategoryOption,
    );
    const nextIsOtherCategory = isOtherCategory(nextCategoryOption);

    setFormValues((previousValues) => {
      const previousCategoryOption = categoryOptions.find(
        (option) => option.value === previousValues.category,
      );
      const previousAllowsFlexiblePolicies = allowsFlexibleRentalPolicies(
        previousCategoryOption,
      );

      return {
        ...previousValues,
        category: nextCategory,
        labelPrefix: nextIsOtherCategory ? "" : previousValues.labelPrefix,
        rentalPolicies: nextAllowsFlexiblePolicies
          ? previousAllowsFlexiblePolicies
            ? previousValues.rentalPolicies
            : ""
          : nextCategory
            ? "always"
            : "",
      };
    });
  };

  const resetForm = () => {
    setFormValues(createEmptyForm());

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRequestClose = () => {
    if (isPending || submitGuardRef.current) {
      return;
    }

    setIsCancelConfirmOpen(true);
  };

  const handleCancel = () => {
    if (isPending || submitGuardRef.current) {
      return;
    }

    setIsCancelConfirmOpen(true);
  };

  const handleCloseCancelConfirm = () => {
    if (isPending || submitGuardRef.current) {
      return;
    }

    setIsCancelConfirmOpen(false);
  };

  const handleConfirmCancel = (event) => {
    if (isPending || submitGuardRef.current) {
      return;
    }

    setIsCancelConfirmOpen(false);
    resetForm();
    onClose?.("cancel-confirm", event);
  };

  const handleFileSelect = (event) => {
    if (isPending) {
      return;
    }

    const [selectedFile] = Array.from(event.target.files ?? []);

    updateFormValue("imageFile", selectedFile ?? null);
  };

  const handleRemoveFile = () => {
    if (isPending) {
      return;
    }

    updateFormValue("imageFile", null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isRequiredFormComplete || isPending || submitGuardRef.current) {
      return;
    }

    submitGuardRef.current = true;

    const { category, ...otherFormValues } = formValues;
    const submittedValues = {
      ...otherFormValues,
      categoryKey: category,
      name: formValues.name.trim(),
      accessories: formValues.accessories.trim(),
      specification: formValues.specification.trim(),
      description: formValues.description.trim(),
      labelPrefix: isOtherCategorySelected
        ? ""
        : formValues.labelPrefix.trim(),
    };

    try {
      await onConfirm?.(submittedValues, event);
      resetForm();
    } catch {
      // 실패 시 사용자가 입력한 값을 그대로 유지함.
    } finally {
      submitGuardRef.current = false;
    }
  };

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={handleRequestClose}
        className={styles.modal}
        ariaLabelledBy={titleId}
        closeOnEscape={!isPending}
        closeOnOverlay={!isPending}
        returnFocusRef={returnFocusRef}
      >
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <header className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              모델 등록
            </h2>
          </header>

          <div className={styles.content}>

            <div className={styles.pairRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={categoryId}>
                  카테고리*
                </label>
                <Select
                  id={categoryId}
                  className={styles.select}
                  width="100%"
                  options={categoryOptions}
                  value={formValues.category}
                  placeholder="카테고리를 선택하세요."
                  ariaLabel="모델 카테고리"
                  disabled={metadataInputsDisabled}
                  onChange={handleCategoryChange}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={statusId}>
                  상태*
                </label>
                <Select
                  id={statusId}
                  className={styles.select}
                  width="100%"
                  options={STATUS_OPTIONS}
                  value={formValues.status}
                  placeholder="대여 상태를 선택하세요."
                  ariaLabel="모델 대여 상태"
                  disabled={metadataInputsDisabled}
                  onChange={(nextValue) => updateFormValue("status", nextValue)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={nameId}>
                모델명*
              </label>

              <div className={styles.inputWrap}>
                <InputBar
                  id={nameId}
                  width="100%"
                  height="md"
                  name="equipmentName"
                  value={formValues.name}
                  placeholder="모델명을 입력하세요"
                  required
                  maxLength={100}
                  status={metadataInputsDisabled ? "disabled" : "default"}
                  onChange={handleTextChange("name")}
                />
              </div>
            </div>

            <div
              className={`${styles.pairRow} ${isOtherCategorySelected ? styles.singleFieldRow : ""
                }`}
            >
              <div className={styles.field}>
                <span className={styles.label}>모델 사진*</span>

                <input
                  ref={fileInputRef}
                  id={imageFileId}
                  className={styles.fileInput}
                  type="file"
                  name="imageFile"
                  accept="image/*"
                  required
                  disabled={isPending}
                  onChange={handleFileSelect}
                />

                {formValues.imageFile ? (
                  <div className={styles.fileItem}>
                    <span
                      className={styles.fileName}
                      title={formValues.imageFile.name}
                    >
                      {formValues.imageFile.name}
                    </span>

                    <span className={styles.fileSize}>
                      {formatFileSize(formValues.imageFile.size)}
                    </span>

                    <IconButton
                      icon="trash"
                      size={24}
                      type="button"
                      ariaLabel={`${formValues.imageFile.name} 파일 제거`}
                      disabled={isPending}
                      onClick={handleRemoveFile}
                    />
                  </div>
                ) : (
                  <IconTextButton
                    className={styles.fileSelectButton}
                    icon="paperclip"
                    border
                    type="button"
                    text="파일 선택"
                    ariaLabel="모델 사진 선택"
                    disabled={isPending}
                    onClick={() => fileInputRef.current?.click()}
                  />
                )}
              </div>
              {!isOtherCategorySelected ? (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={labelPrefixId}>
                    라벨 번호 접두사*
                  </label>

                  <div className={styles.inputWrap}>
                    <InputBar
                      id={labelPrefixId}
                      width="100%"
                      height="md"
                      name="labelPrefix"
                      value={formValues.labelPrefix}
                      placeholder="예) ABC"
                      required
                      maxLength={10}
                      status={metadataInputsDisabled ? "disabled" : "default"}
                      onChange={handleTextChange("labelPrefix")}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className={styles.pairRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={receivedDateId}>
                  입고일*
                </label>
                <Select
                  id={receivedDateId}
                  className={styles.select}
                  type="calendar"
                  width="100%"
                  value={formValues.receivedDate}
                  placeholder="날짜를 선택하세요."
                  ariaLabel="모델 입고일"
                  disabled={metadataInputsDisabled}
                  onChange={(nextDate) =>
                    updateFormValue("receivedDate", nextDate)
                  }
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor={disposalDateId}>
                  폐기일*
                </label>
                <Select
                  id={disposalDateId}
                  className={styles.select}
                  type="calendar"
                  width="100%"
                  value={formValues.disposalDate}
                  placeholder="날짜를 선택하세요."
                  ariaLabel="모델 폐기일"
                  disabled={metadataInputsDisabled}
                  onChange={(nextDate) =>
                    updateFormValue("disposalDate", nextDate)
                  }
                />
              </div>
            </div>


            <div className={styles.field}>
              <label className={styles.label} htmlFor={accessoriesId}>
                구성품*
              </label>

              <div className={styles.inputWrap}>
                <InputBar
                  id={accessoriesId}
                  width="100%"
                  height="md"
                  name="accessories"
                  value={formValues.accessories}
                  placeholder="구성품을 입력하세요"
                  required
                  status={metadataInputsDisabled ? "disabled" : "default"}
                  onChange={handleTextChange("accessories")}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={specificationId}>
                성능
              </label>

              <div className={styles.inputWrap}>
                <InputBar
                  id={specificationId}
                  width="100%"
                  height="md"
                  name="specification"
                  value={formValues.specification}
                  placeholder="성능을 입력하세요 (선택)"
                  status={metadataInputsDisabled ? "disabled" : "default"}
                  onChange={handleTextChange("specification")}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={descriptionId}>
                설명
              </label>

              <div className={styles.inputWrap}>
                <InputBar
                  id={descriptionId}
                  width="100%"
                  height="md"
                  name="description"
                  value={formValues.description}
                  placeholder="설명을 입력하세요 (선택)"
                  status={metadataInputsDisabled ? "disabled" : "default"}
                  onChange={handleTextChange("description")}
                />
              </div>
            </div>

          </div>

          <footer className={styles.actions}>
            <Button
              ref={cancelButtonRef}
              className={styles.actionButton}
              kind="border"
              size="Default"
              color="Neutral"
              status="Default"
              text="취소"
              type="button"
              disabled={isPending}
              onClick={handleCancel}
            />

            <Button
              className={styles.actionButton}
              kind="fill"
              size="Default"
              color="Primary"
              status="Default"
              text={
                isPending
                  ? "처리 중"
                  : isMetadataLocked
                    ? "이미지 업로드 재시도"
                    : "등록"
              }
              type="submit"
              disabled={!isRequiredFormComplete || isPending}
            />
          </footer>
        </form>
      </BaseModal>

      <ConfirmModal
        isOpen={isCancelConfirmOpen}
        icon="warning"
        title="취소하고 나가시겠습니까?"
        description={
          isMetadataLocked
            ? "모델 정보는 이미 서버에 등록되었습니다. 닫으면 이미지 없이 등록된 상태가 유지됩니다."
            : "작성 중이던 내용이 모두 초기화됩니다."
        }
        cancelText="취소"
        confirmText="확인"
        confirmColor="Danger"
        onClose={handleCloseCancelConfirm}
        onConfirm={handleConfirmCancel}
        returnFocusRef={cancelButtonRef}
      />
    </>
  );
}

export default EquipmentCreateModal;
