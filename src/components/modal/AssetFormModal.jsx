//개별 기자재 등록,수정
import { useId, useState } from "react";

import Button from "../common/Button";
import InputBar from "../common/Input";
import Select from "../common/Select";
import BaseModal from "./BaseModal";

import styles from "./AssetFormModal.module.css";

const STATUS_OPTIONS = [
  {
    value: "available",
    label: "대여 가능",
  },
  {
    value: "rented",
    label: "대여 중",
  },
  {
    value: "broken",
    label: "고장",
  },
  {
    value: "disposalScheduled",
    label: "폐기 예정",
  },
];

function normalizeText(value) {
  return String(value ?? "").trim();
}

function getLabelSuffix(labelNumber, labelPrefix) {
  const normalizedLabelNumber = normalizeText(labelNumber);
  const normalizedPrefix = normalizeText(labelPrefix);

  if (!normalizedPrefix) {
    return normalizedLabelNumber;
  }

  const prefixWithSeparator = `${normalizedPrefix}-`;

  if (normalizedLabelNumber.startsWith(prefixWithSeparator)) {
    return normalizedLabelNumber.slice(prefixWithSeparator.length);
  }

  return normalizedLabelNumber;
}

function buildLabelNumber(labelPrefix, labelSuffix) {
  const normalizedPrefix = normalizeText(labelPrefix);
  const normalizedSuffix = normalizeText(labelSuffix);

  if (!normalizedPrefix) {
    return normalizedSuffix;
  }

  return `${normalizedPrefix}-${normalizedSuffix}`;
}

function createFormValues(mode, asset, labelPrefix) {
  if (mode === "edit" && asset) {
    return {
      quantity: "",
      status: asset.status ?? "",
      labelSuffix: getLabelSuffix(asset.labelNumber, labelPrefix),
      assetNumber: asset.assetNumber ?? "",
      notes: asset.notes ?? "",
    };
  }

  return {
    quantity: "",
    status: "",
    labelSuffix: "",
    assetNumber: "",
    notes: "",
  };
}

function normalizeComparableValues(values) {
  return {
    quantity: normalizeText(values.quantity),
    status: values.status,
    labelSuffix: normalizeText(values.labelSuffix),
    assetNumber: normalizeText(values.assetNumber),
    notes: normalizeText(values.notes),
  };
}

function hasChangedValues(currentValues, initialValues) {
  return (
    JSON.stringify(normalizeComparableValues(currentValues)) !==
    JSON.stringify(normalizeComparableValues(initialValues))
  );
}

function AssetFormModalContent({
  asset,
  isPending = false,
  labelPrefix = "",
  mode = "create",
  modelId,
  modelName,
  onClose,
  onConfirm,
  returnFocusRef,
}) {
  const generatedId = useId();

  const [initialValues] = useState(() =>
    createFormValues(mode, asset, labelPrefix),
  );

  const [formValues, setFormValues] = useState(() =>
    createFormValues(mode, asset, labelPrefix),
  );

  const titleId = `${generatedId}-title`;
  const quantityId = `${generatedId}-quantity`;
  const statusId = `${generatedId}-status`;
  const labelNumberId = `${generatedId}-label-number`;
  const assetNumberId = `${generatedId}-asset-number`;
  const notesId = `${generatedId}-notes`;

  const isCreateMode = mode === "create";

  const quantity = Number(formValues.quantity);

  const hasRequiredValues =
    Boolean(formValues.status) &&
    Boolean(normalizeText(formValues.labelSuffix)) &&
    Boolean(normalizeText(formValues.assetNumber)) &&
    (!isCreateMode ||
      (Number.isInteger(quantity) &&
        quantity > 0 &&
        normalizeText(formValues.quantity) !== ""));

  const hasChanges = hasChangedValues(formValues, initialValues);

  const canSubmit =
    hasRequiredValues && (isCreateMode || hasChanges) && !isPending;

  const updateFormValue = (field, value) => {
    setFormValues((previousValues) => ({
      ...previousValues,
      [field]: value,
    }));
  };

  const handleTextChange = (field) => (event) => {
    updateFormValue(field, event.target.value);
  };

  const handleRequestClose = (reason, event) => {
    if (isPending) {
      return;
    }

    onClose?.(reason, event);
  };

  const handleCancel = (event) => {
    handleRequestClose("cancel", event);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    if (isCreateMode) {
      onConfirm?.(
        {
          modelId,
          quantity,
          status: formValues.status,
          labelPrefix: normalizeText(labelPrefix),
          labelStart: normalizeText(formValues.labelSuffix),
          assetNumberStart: normalizeText(formValues.assetNumber),
          notes: normalizeText(formValues.notes),
        },
        event,
      );

      return;
    }

    onConfirm?.(
      {
        modelId,
        itemId: asset.itemId,
        status: formValues.status,
        labelNumber: buildLabelNumber(labelPrefix, formValues.labelSuffix),
        assetNumber: normalizeText(formValues.assetNumber),
        notes: normalizeText(formValues.notes),
      },
      event,
    );
  };

  return (
    <BaseModal
      isOpen
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
            {isCreateMode ? "기기 등록" : "기기 수정"}
          </h2>
        </header>

        <div className={styles.content}>
          <section className={styles.modelInformation}>
            <h3 className={styles.modelLabel}>기자재</h3>

            <strong className={styles.modelName}>
              {modelName || "개별 기자재"}
            </strong>
          </section>

          <div className={styles.fields}>
            {isCreateMode ? (
              <div className={styles.pairRow}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={quantityId}>
                    등록할 수량*
                  </label>

                  <InputBar
                    id={quantityId}
                    width="100%"
                    height="md"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    name="quantity"
                    value={formValues.quantity}
                    placeholder="예) 100"
                    disabled={isPending}
                    onChange={handleTextChange("quantity")}
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
                    placeholder="상태 선택"
                    ariaLabel="개별 기자재 상태"
                    disabled={isPending}
                    onChange={(nextValue) =>
                      updateFormValue("status", nextValue)
                    }
                  />
                </div>
              </div>
            ) : (
              <div className={styles.editStatusRow}>
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
                    placeholder="상태 선택"
                    ariaLabel="개별 기자재 상태"
                    disabled={isPending}
                    onChange={(nextValue) =>
                      updateFormValue("status", nextValue)
                    }
                  />
                </div>
              </div>
            )}

            <div className={styles.pairRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={labelNumberId}>
                  {isCreateMode ? "라벨 시작 번호*" : "라벨 번호*"}
                </label>

                <div className={styles.prefixedInput}>
                  {labelPrefix ? (
                    <strong className={styles.prefix}>{labelPrefix}-</strong>
                  ) : null}

                  <InputBar
                    id={labelNumberId}
                    width="100%"
                    height="md"
                    inputMode="numeric"
                    name="labelNumber"
                    value={formValues.labelSuffix}
                    placeholder={isCreateMode ? "예) 001" : "라벨 번호"}
                    disabled={isPending}
                    onChange={handleTextChange("labelSuffix")}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor={assetNumberId}>
                  {isCreateMode ? "비품 번호 시작 번호*" : "비품 번호*"}
                </label>

                <InputBar
                  id={assetNumberId}
                  width="100%"
                  height="md"
                  inputMode="numeric"
                  name="assetNumber"
                  value={formValues.assetNumber}
                  placeholder={isCreateMode ? "예) 1111111" : "비품 번호"}
                  disabled={isPending}
                  onChange={handleTextChange("assetNumber")}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={notesId}>
                특이사항
              </label>

              <InputBar
                id={notesId}
                width="100%"
                height="md"
                name="notes"
                value={formValues.notes}
                placeholder="특이사항 입력"
                disabled={isPending}
                onChange={handleTextChange("notes")}
              />
            </div>
          </div>
        </div>

        <footer className={styles.actions}>
          <Button
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
            text={isPending ? "처리 중" : isCreateMode ? "등록" : "수정"}
            type="submit"
            disabled={!canSubmit}
          />
        </footer>
      </form>
    </BaseModal>
  );
}

function AssetFormModal(props) {
  if (!props.isOpen) {
    return null;
  }

  const modalKey = [
    props.mode,
    props.modelId,
    props.asset?.itemId ?? "new",
  ].join(":");

  return <AssetFormModalContent key={modalKey} {...props} />;
}

export default AssetFormModal;
