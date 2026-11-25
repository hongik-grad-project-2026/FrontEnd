import styles from "./RouletteWheel.module.css";

const CENTER = 200;
const WHEEL_RADIUS = 178;
const RIM_RADIUS = 196;
const BULB_RADIUS = 187;
const BULB_COUNT = 24;
const IMAGE_DISTANCE = 108;
const LABEL_DISTANCE = 156;

function polar(angle, radius) {
  const radian = (angle * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.sin(radian),
    y: CENTER - radius * Math.cos(radian),
  };
}

function segmentPath(startAngle, endAngle, radius = WHEEL_RADIUS) {
  const start = polar(startAngle, radius);
  const end = polar(endAngle, radius);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

// 좁은 칸에서도 이미지가 칸 밖으로 넘치지 않게 크기를 줄임.
function imageSizeFor(sweep) {
  const chord = 2 * IMAGE_DISTANCE * Math.sin((sweep * Math.PI) / 360);
  return Math.max(28, Math.min(56, chord * 0.78));
}

// 룰렛 원판 화면 컴포넌트임. 회전은 rotorRef의 transform을 직접 바꿔서 처리함.
function RouletteWheel({
  segments,
  phase,
  rotorRef,
  pointerRef,
  onStart,
  startButtonRef,
}) {
  const isWon = phase === "won";
  const isSpinning = phase === "spinning";

  return (
    <div className={styles.wheel} data-phase={phase}>
      <svg
        className={styles.svg}
        viewBox="0 0 400 400"
        role="img"
        aria-label={`간식 룰렛, ${segments.map((s) => s.label).join(", ")}`}
      >
        <circle className={styles.rim} cx={CENTER} cy={CENTER} r={RIM_RADIUS} />

        {Array.from({ length: BULB_COUNT }, (_, index) => {
          const { x, y } = polar((360 / BULB_COUNT) * index, BULB_RADIUS);
          return (
            <circle
              key={index}
              className={styles.bulb}
              data-odd={index % 2 === 1}
              cx={x}
              cy={y}
              r={3.6}
            />
          );
        })}

        <g ref={rotorRef} transform={`rotate(0 ${CENTER} ${CENTER})`}>
          {segments.map((segment) => (
            <path
              key={segment.id}
              className={styles.segment}
              data-dimmed={isWon && !segment.isResult}
              d={segmentPath(segment.startAngle, segment.endAngle)}
              style={{ fill: segment.theme.fill }}
            />
          ))}

          {segments.map((segment) => {
            const middle = segment.startAngle + segment.sweep / 2;
            const size = imageSizeFor(segment.sweep);

            return (
              <g
                key={`${segment.id}-content`}
                className={styles.content}
                data-dimmed={isWon && !segment.isResult}
                transform={`rotate(${middle} ${CENTER} ${CENTER})`}
              >
                <text
                  className={styles.label}
                  x={CENTER}
                  y={CENTER - LABEL_DISTANCE}
                  style={{ fill: segment.theme.text }}
                >
                  {segment.label}
                </text>
                {segment.imageUrl ? (
                  <image
                    href={segment.imageUrl}
                    x={CENTER - size / 2}
                    y={CENTER - IMAGE_DISTANCE - size / 2}
                    width={size}
                    height={size}
                    preserveAspectRatio="xMidYMid meet"
                  />
                ) : null}
              </g>
            );
          })}

          {isWon
            ? segments
                .filter((segment) => segment.isResult)
                .map((segment) => (
                  <path
                    key={`${segment.id}-highlight`}
                    className={styles.highlight}
                    d={segmentPath(segment.startAngle, segment.endAngle)}
                  />
                ))
            : null}
        </g>

        <circle
          className={styles.innerRing}
          cx={CENTER}
          cy={CENTER}
          r={WHEEL_RADIUS}
        />
      </svg>

      <span ref={pointerRef} className={styles.pointer} aria-hidden="true">
        <svg viewBox="0 0 40 52">
          <path d="M20 50 L6 22 A16 16 0 1 1 34 22 Z" />
          <circle cx="20" cy="17" r="6" />
        </svg>
      </span>

      <button
        ref={startButtonRef}
        type="button"
        className={styles.startButton}
        onClick={onStart}
        disabled={phase !== "idle"}
        aria-label={isWon ? "추첨 완료" : isSpinning ? "추첨 중" : "룰렛 돌리기"}
      >
        {isWon ? "WIN!" : isSpinning ? "···" : "START"}
      </button>
    </div>
  );
}

export default RouletteWheel;
