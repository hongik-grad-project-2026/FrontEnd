import { useRef, useState } from "react";

import Button from "../../components/common/Button";
import SnackRouletteModal from "./SnackRouletteModal";
import { MOCK_SNACK_ROULETTE } from "./snackEvent";

// 개발 모드 전용 미리보기 페이지임. (/dev/snack-roulette)
// 목데이터로 룰렛 모달만 띄워 보고, 당첨 결과를 바꿔 가며 확인함.
function SnackRoulettePreviewPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [resultId, setResultId] = useState(MOCK_SNACK_ROULETTE.resultId);
  const triggerRef = useRef(null);

  return (
    <main style={{ display: "grid", gap: 16, padding: 40, justifyItems: "start" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>간식 룰렛 모달 미리보기</h1>

      <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
        당첨 결과
        <select value={resultId} onChange={(event) => setResultId(event.target.value)}>
          {MOCK_SNACK_ROULETTE.prizes.map((prize) => (
            <option key={prize.id} value={prize.id}>
              {prize.label}
            </option>
          ))}
        </select>
      </label>

      <Button
        ref={triggerRef}
        kind="fill"
        size="Default"
        color="Primary"
        status="Default"
        text="룰렛 모달 열기"
        onClick={() => setIsOpen(true)}
      />

      <SnackRouletteModal
        isOpen={isOpen}
        prizes={MOCK_SNACK_ROULETTE.prizes}
        resultId={resultId}
        onClose={() => setIsOpen(false)}
        returnFocusRef={triggerRef}
      />
    </main>
  );
}

export default SnackRoulettePreviewPage;
