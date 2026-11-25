// 졸업전시(11-26~27) 간식 이벤트 전용 모듈임. 전시 후 src/events/snack 폴더째 삭제함.

// 룰렛 칸 크기(도)임. 0번 칸이 가장 작고, 당첨 결과가 항상 이 칸에 들어감.
// 나머지 칸은 크기를 제각각으로 둬서 "작은 칸에 걸렸다"는 긴장감을 줌.
export const ROULETTE_SLOT_ANGLES = [28, 74, 52, 82, 56, 68];

// 칸 색상은 기존 디자인 토큰만 사용함. 이웃한 칸끼리 겹치지 않게 배치함.
const SEGMENT_THEMES = [
  { fill: "var(--color-brand-primary)", text: "var(--color-white)" },
  { fill: "var(--color-white)", text: "var(--color-brand-primary-dark)" },
  { fill: "var(--color-brand-secondary)", text: "var(--color-brand-primary-dark)" },
  { fill: "var(--color-brand-primary-dark)", text: "var(--color-white)" },
  { fill: "var(--color-white)", text: "var(--color-brand-primary-dark)" },
  { fill: "var(--color-brand-secondary)", text: "var(--color-brand-primary-dark)" },
];

// 목데이터임. 실제 연동 시 서버 응답(경품 목록 + 당첨 결과)으로 교체함.
export const MOCK_SNACK_ROULETTE = Object.freeze({
  resultId: "A",
  prizes: [
    { id: "A", label: "A", name: "A 간식", imageUrl: "/images/snack/a.png" },
    { id: "B", label: "B", name: "B 간식", imageUrl: "/images/snack/b.png" },
    { id: "C", label: "C", name: "C 간식", imageUrl: "/images/snack/c.png" },
    { id: "D", label: "D", name: "D 간식", imageUrl: "/images/snack/d.png" },
    { id: "E", label: "E", name: "E 간식", imageUrl: "/images/snack/e.png" },
    { id: "F", label: "F", name: "F 간식", imageUrl: "/images/snack/f.png" },
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

  // 경품이 6개보다 적어도 한 바퀴(360도)를 채우도록 비율을 맞춤.
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
