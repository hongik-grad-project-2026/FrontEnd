// 졸업전시(11-26~27) 간식 이벤트 전용 모듈임. 전시 후 src/events/snack 폴더째 삭제함.

// 간식 칸에 항상 멈추도록 첫 칸을 작게 배치함.
export const ROULETTE_SLOT_ANGLES = [36, 81, 81, 81, 81];

// 칸 색상은 기존 디자인 토큰만 사용함. 이웃한 칸끼리 겹치지 않게 배치함.
const SEGMENT_THEMES = [
  { fill: "var(--color-brand-primary)", text: "var(--color-white)" },
  { fill: "var(--color-white)", text: "var(--color-brand-primary-dark)" },
  { fill: "var(--color-brand-secondary)", text: "var(--color-brand-primary-dark)" },
  { fill: "var(--color-brand-primary-dark)", text: "var(--color-white)" },
  { fill: "var(--color-white)", text: "var(--color-brand-primary-dark)" },
];

// 다섯 칸은 연출용이며, 실제 지급 간식은 서버 신청 응답을 사용함.
export const MOCK_SNACK_ROULETTE = Object.freeze({
  resultId: "snack",
  prizes: [
    { id: "snack", label: "간식", labelLines: ["간식"] },
    { id: "porsche", label: "포르쉐카이엔", labelLines: ["포르쉐", "카이엔"] },
    { id: "lottery", label: "로또 1등 당첨 실물 용지", labelLines: ["로또 1등", "당첨 실물 용지"] },
    { id: "skhynix", label: "SK 하이닉스 10주", labelLines: ["SK 하이닉스", "10주"] },
    { id: "birkin", label: "에르메스 버킨백", labelLines: ["에르메스", "버킨백"] },
  ],
});

// 경품 목록을 룰렛 칸으로 바꿈. 각도는 12시 방향에서 시계 방향으로 잼.
export function buildRouletteSegments(prizes = [], resultId) {
  const result = prizes.find((prize) => prize.id === resultId);
  const others = prizes.filter((prize) => prize.id !== resultId);
  const ordered = (result ? [result, ...others] : others).slice(
    0,
    ROULETTE_SLOT_ANGLES.length,
  );

  // 칸 수가 달라져도 한 바퀴(360도)를 채우도록 비율을 맞춤.
  const slots = ROULETTE_SLOT_ANGLES.slice(0, ordered.length);
  const slotTotal = slots.reduce((sum, angle) => sum + angle, 0) || 1;

  let startAngle = 0;

  return ordered.map((prize, index) => {
    const sweep = (slots[index] / slotTotal) * 360;
    const segment = {
      ...prize,
      startAngle,
      endAngle: startAngle + sweep,
      sweep,
      isResult: Boolean(result) && index === 0,
      theme: SEGMENT_THEMES[index % SEGMENT_THEMES.length],
    };

    startAngle += sweep;
    return segment;
  });
}
