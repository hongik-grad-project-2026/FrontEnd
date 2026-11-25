import { useId, useMemo, useRef } from "react";

import Button from "../../components/common/Button";
import BaseModal from "../../components/modal/BaseModal";
import Confetti from "./Confetti";
import RouletteWheel from "./RouletteWheel";
import { buildRouletteSegments } from "./snackEvent";
import { useRouletteSpin } from "./useRouletteSpin";

import styles from "./SnackRouletteModal.module.css";

const GUIDE_TEXT = {
  idle: "START 버튼을 눌러 간식을 뽑아 보세요!",
  spinning: "두근두근... 어디에 멈출까요?",
  won: "당첨을 축하합니다!",
};

function SnackRouletteModal(props) {
  const { isOpen = false, prizes, resultId } = props;

  if (!prizes?.length) {
    return null;
  }

  // 열 때마다 처음(멈춘 상태)부터 시작하도록 다시 마운트함.
  return <SnackRouletteModalContent key={`${resultId}:${isOpen}`} {...props} />;
}

function SnackRouletteModalContent({
  isOpen = false,
  prizes,
  resultId,
  onClose,
  returnFocusRef,
}) {
  const titleId = `${useId()}-title`;
  const startButtonRef = useRef(null);
  const confirmButtonRef = useRef(null);

  const segments = useMemo(
    () => buildRouletteSegments(prizes, resultId),
    [prizes, resultId],
  );
  const result = segments.find((segment) => segment.isResult);

  const { phase, spin, rotorRef, pointerRef } = useRouletteSpin({
    segments,
    onReveal: () => {
      requestAnimationFrame(() => confirmButtonRef.current?.focus());
    },
  });

  const isWon = phase === "won";
  const canClose = phase !== "spinning";

  const handleClose = (reason, event) => {
    if (canClose) onClose?.(reason, event);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnEscape={canClose}
      closeOnOverlay={false}
      className={styles.modal}
      ariaLabelledBy={titleId}
      initialFocusRef={startButtonRef}
      returnFocusRef={returnFocusRef}
    >
      <header className={styles.header}>
        <span className={styles.eventBadge}>졸업전시 이벤트</span>
        <h2 id={titleId}>간식 룰렛</h2>
      </header>

      <div className={styles.body}>
        <p className={styles.guide} aria-live="polite">
          {GUIDE_TEXT[phase]}
        </p>

        <div className={styles.stage}>
          <RouletteWheel
            segments={segments}
            phase={phase}
            rotorRef={rotorRef}
            pointerRef={pointerRef}
            startButtonRef={startButtonRef}
            onStart={spin}
          />

          {isWon && result ? (
            <div className={styles.resultLayer}>
              <div className={styles.resultCard} role="status">
                <span className={styles.burst} aria-hidden="true" />
                {result.imageUrl ? (
                  <img className={styles.resultImage} src={result.imageUrl} alt="" />
                ) : null}
                <p className={styles.resultEyebrow}>축하합니다!</p>
                <p className={styles.resultTitle}>
                  <strong>{result.label}</strong> 당첨!
                </p>
                {result.name ? (
                  <p className={styles.resultName}>{result.name}</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <ul className={styles.prizeList} aria-label="경품 목록">
          {prizes.map((prize) => (
            <li
              key={prize.id}
              className={styles.prizeItem}
              data-selected={isWon && prize.id === resultId}
            >
              {prize.imageUrl ? <img src={prize.imageUrl} alt="" /> : null}
              <span>{prize.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <footer className={styles.actions}>
        <Button
          ref={confirmButtonRef}
          kind="fill"
          size="Default"
          color="Primary"
          status="Default"
          text={isWon ? "확인" : "룰렛을 돌려 주세요"}
          disabled={!isWon}
          onClick={(event) => handleClose("confirm", event)}
        />
      </footer>

      {isWon ? <Confetti /> : null}
    </BaseModal>
  );
}

export default SnackRouletteModal;
