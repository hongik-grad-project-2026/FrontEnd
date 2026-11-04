// 기자재 모델 수정 모달임.
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

function parseDisplayDate(value) {
  if (typeof value !== "string") {
    return null;
  }

  const matchedDate = value.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);

  if (!matchedDate) {
    return null;
  }

  const [, year, month, day] = matchedDate;

  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getDateTimestamp(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return null;
  }

  return value.getTime();
}

function hasChangedValues(currentValues, initialValues) {
  return (
    currentValues.category !== initialValues.category ||
    currentValues.status !== initialValues.status ||
    currentValues.rentalPolicies.length !== initialValues.rentalPolicies.length ||
    currentValues.rentalPolicies.some(
      (policy) => !initialValues.rentalPolicies.includes(policy),
    ) ||
    getDateTimestamp(currentValues.receivedDate) !==
    getDateTimestamp(initialValues.receivedDate) ||
    getDateTimestamp(currentValues.disposalDate) !==
    getDateTimestamp(initialValues.disposalDate) ||
    normalizeText(currentValues.name) !== normalizeText(initialValues.name) ||
    normalizeText(currentValues.modelName) !==
    normalizeText(initialValues.modelName) ||
    normalizeText(currentValues.accessories) !==
    normalizeText(initialValues.accessories) ||
    normalizeText(currentValues.specification) !==
    normalizeText(initialValues.specification) ||
    normalizeText(currentValues.description) !==
    normalizeText(initialValues.description) ||
    normalizeText(currentValues.labelPrefix) !==
    normalizeText(initialValues.labelPrefix) ||
    currentValues.replacementImageFile !== initialValues.replacementImageFile
  );
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

function createInitialForm(equipment, categoryOptions) {
  const initialCategory = equipment.categoryKey ?? "";
  const initialCategoryOption = categoryOptions.find(
    (option) => option.value === initialCategory,
  );

  return {
    category: initialCategory,
    status: equipment.status ?? "",
    rentalPolicies: Array.isArray(equipment.rentalPolicies)
      ? [...equipment.rentalPolicies]
      : [],
    receivedDate: parseDisplayDate(equipment.receivedDate),
    disposalDate: parseDisplayDate(equipment.disposalDate),
    name: equipment.name ?? "",
    modelName: equipment.modelName ?? "",
    accessories: equipment.accessories ?? "",
    specification: equipment.specification ?? "",
    description: equipment.description ?? "",
    labelPrefix: isOtherCategory(initialCategoryOption)
      ? ""
      : equipment.labelPrefix ?? "",
    replacementImageFile: null,
  };
}

function EquipmentItemEditModal({
  categoryOptions = [],
  equipment,
  isOpen = false,
  isPending = false,
  onClose,
  onConfirm,
  returnFocusRef,
}) {
  const generatedId = useId();
  const fileInputRef = useRef(null);
  const cancelButtonRef = useRef(null);

  const [initialFormValues] = useState(() =>
    createInitialForm(equipment, categoryOptions),
  );

  const [formValues, setFormValues] = useState(() =>
    createInitialForm(equipment, categoryOptions),
  );

  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const titleId = `${generatedId}-title`;
  const categoryId = `${generatedId}-category`;
  const statusId = `${generatedId}-status`;
  const rentalPolicyId = `${generatedId}-rental-policy`;
  const receivedDateId = `${generatedId}-received-date`;
  const disposalDateId = `${generatedId}-disposal-date`;
  const nameId = `${generatedId}-name`;
  const accessoriesId = `${generatedId}-accessories`;
  const specificationId = `${generatedId}-specification`;
  const descriptionId = `${generatedId}-description`;
  const labelPrefixId = `${generatedId}-label-prefix`;
  const replacementImageId = `${generatedId}-replacement-image`;

  const selectedCategoryOption = categoryOptions.find(
    (option) => option.value === formValues.category,
  );
  const allowsFlexiblePolicies = allowsFlexibleRentalPolicies(
    selectedCategoryOption,
  );
  const isOtherCategorySelected = isOtherCategory(selectedCategoryOption);
  const hasRentalPolicies = formValues.rentalPolicies.length > 0;
  const hasRequiredLabelPrefix =
    isOtherCategorySelected || Boolean(normalizeText(formValues.labelPrefix));

  const hasFormChanges = hasChangedValues(formValues, initialFormValues);

  const updateFormValue = (field, value) => {
    setFormValues((previousValues) => ({
      ...previousValues,
      [field]: value,
    }));
  };

  const handleTextChange = (field) => (event) => {
    updateFormValue(field, event.target.value);
  };

  const handleCategoryChange = (nextCategory) => {
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
            : []
          : nextCategory
            ? ["always"]
            : [],
      };
    });
  };

  const handleRentalPolicyChange = (nextPolicies) => {
    updateFormValue("rentalPolicies", nextPolicies);
  };

  const handleRequestClose = () => {
    if (isPending) {
      return;
    }

    setIsCancelConfirmOpen(true);
  };

  const handleCancel = () => {
    if (isPending) {
      return;
    }

    setIsCancelConfirmOpen(true);
  };

  const handleCloseCancelConfirm = () => {
    setIsCancelConfirmOpen(false);
  };

  const handleConfirmCancel = (event) => {
    if (isPending) {
      return;
    }

    setIsCancelConfirmOpen(false);
    onClose?.("cancel-confirm", event);
  };

  const handleFileSelect = (event) => {
    const [selectedFile] = Array.from(event.target.files ?? []);

    updateFormValue("replacementImageFile", selectedFile ?? null);
  };

  const handleRemoveFile = () => {
    updateFormValue("replacementImageFile", null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !hasFormChanges ||
      !hasRentalPolicies ||
      !hasRequiredLabelPrefix ||
      isPending
    ) {
      return;
    }

    const submittedValues = {
      modelId: equipment.modelId,
      categoryKey: formValues.category,
      status: formValues.status,
      rentalPolicies: [...formValues.rentalPolicies],
      receivedDate: formValues.receivedDate,
      disposalDate: formValues.disposalDate,
      name: normalizeText(formValues.name),
      modelName: normalizeText(formValues.modelName),
      accessories: normalizeText(formValues.accessories),
      specification: normalizeText(formValues.specification),
      description: normalizeText(formValues.description),
      labelPrefix: isOtherCategorySelected
        ? ""
        : normalizeText(formValues.labelPrefix),
      replacementImageFile: formValues.replacementImageFile,
    };

    try {
      await onConfirm?.(submittedValues, event);
    } catch {
      // 실패 시 사용자가 입력한 값을 그대로 유지함.
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
              기자재 수정
            </h2>
          </header>

          <div className={styles.content}>
            <div
              className={`${styles.pairRow} ${
                isOtherCategorySelected ? styles.singleFieldRow : ""
              }`}
            >

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
                  ariaLabel="기자재 카테고리"
                  onChange={handleCategoryChange}
                />
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
                      onChange={handleTextChange("labelPrefix")}
                    />
                  </div>
                </div>
              ) : null}
            </div>


            <div className={styles.pairRow}>

              <div className={styles.field}>
                <label className={styles.label} htmlFor={rentalPolicyId}>
                  대여정책*
                </label>
                <Select
                  id={rentalPolicyId}
                  className={styles.select}
                  width="100%"
                  options={RENTAL_POLICY_OPTIONS}
                  value={formValues.rentalPolicies}
                  multiple
                  disabled={!allowsFlexiblePolicies}
                  placeholder="대여정책을 선택하세요"
                  ariaLabel="대여정책"
                  onChange={handleRentalPolicyChange}
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
                  ariaLabel="기자재 대여 상태"
                  onChange={(nextValue) => updateFormValue("status", nextValue)}
                />
              </div>
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
                  ariaLabel="기자재 입고일"
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
                  ariaLabel="기자재 폐기일"
                  onChange={(nextDate) =>
                    updateFormValue("disposalDate", nextDate)
                  }
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
                  placeholder="기자재명을 입력하세요"
                  onChange={handleTextChange("name")}
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
                  onChange={handleTextChange("description")}
                />
              </div>
            </div>




            <div className={styles.field}>
              <span className={styles.label}>기자재 모델 사진*</span>

              <input
                ref={fileInputRef}
                id={replacementImageId}
                className={styles.fileInput}
                type="file"
                name="replacementImageFile"
                accept="image/*"
                onChange={handleFileSelect}
              />

              {formValues.replacementImageFile ? (
                <div className={styles.fileItem}>
                  <span
                    className={styles.fileName}
                    title={formValues.replacementImageFile.name}
                  >
                    {formValues.replacementImageFile.name}
                  </span>

                  <span className={styles.fileSize}>
                    {formatFileSize(formValues.replacementImageFile.size)}
                  </span>

                  <IconButton
                    icon="trash"
                    size={24}
                    type="button"
                    ariaLabel={`${formValues.replacementImageFile.name} 교체 파일 제거`}
                    onClick={handleRemoveFile}
                  />
                </div>
              ) : (
                <IconTextButton
                  className={styles.fileSelectButton}
                  icon="paperclip"
                  border
                  type="button"
                  text="파일 교체"
                  ariaLabel="기자재 모델 사진 교체"
                  onClick={() => fileInputRef.current?.click()}
                />
              )}
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
              text={isPending ? "처리 중" : "수정 완료"}
              type="submit"
              disabled={
                !hasFormChanges ||
                !hasRentalPolicies ||
                !hasRequiredLabelPrefix ||
                isPending
              }
            />
          </footer>
        </form>
      </BaseModal>

      <ConfirmModal
        isOpen={isCancelConfirmOpen}
        icon="warning"
        title="취소하고 나가시겠습니까?"
        description="작성 중이던 내용이 모두 초기화됩니다."
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

export default EquipmentItemEditModal;
