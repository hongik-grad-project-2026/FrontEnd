import { useCallback, useEffect, useRef, useState } from "react";

const SPIN_DURATION_MS = 6800;
const EXTRA_TURNS = 5;
// 지수가 작을수록 끝부분이 길게 늘어짐. 2.6이면 마지막 1~2초 동안
// 바늘이 칸 경계를 천천히 넘어가며 긴장감을 줌.
const EASE_POWER = 2.6;
const REVEAL_DELAY_MS = 450;

const REDUCED_MOTION_DURATION_MS = 1200;

function easeOut(progress) {
  return 1 - Math.pow(1 - progress, EASE_POWER);
}

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

// 바늘(12시 방향)이 가리키는 칸 번호를 찾음.
function findSegmentIndex(segments, rotation) {
  const pointerAngle = normalizeAngle(-rotation);
  const index = segments.findIndex(
    (segment) =>
      pointerAngle >= segment.startAngle && pointerAngle < segment.endAngle,
  );

  return index === -1 ? segments.length - 1 : index;
}

// 룰렛 회전을 requestAnimationFrame으로 직접 그림.
// 매 프레임 각도를 알아야 바늘이 칸을 넘을 때마다 "틱" 하고 흔들 수 있음.
export function useRouletteSpin({ segments, onReveal }) {
  const [phase, setPhase] = useState("idle"); // idle → spinning → won
  const rotorRef = useRef(null);
  const pointerRef = useRef(null);
  const rotationRef = useRef(0);
  const frameRef = useRef(null);
  const timeoutRef = useRef(null);
  const onRevealRef = useRef(onReveal);

  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [onReveal]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const applyRotation = (rotation) => {
    rotationRef.current = rotation;
    rotorRef.current?.setAttribute("transform", `rotate(${rotation} 200 200)`);
  };

  const tickPointer = () => {
    pointerRef.current?.animate(
      [
        { transform: "rotate(0deg)" },
        { transform: "rotate(-22deg)" },
        { transform: "rotate(0deg)" },
      ],
      { duration: 140, easing: "ease-out" },
    );
  };

  const spin = useCallback(() => {
    const result = segments.find((segment) => segment.isResult);

    if (phase !== "idle" || !result) {
      return;
    }

    const reduced = prefersReducedMotion();
    const duration = reduced ? REDUCED_MOTION_DURATION_MS : SPIN_DURATION_MS;
    const turns = reduced ? 1 : EXTRA_TURNS;

    // 시계 방향으로 돌면 바늘은 칸의 끝 경계(endAngle)로 들어옴.
    // 경계를 막 넘은 자리(칸 너비의 20~35%)에 멈춰서 "아슬아슬하게 걸린" 느낌을 줌.
    const landingRatio = 0.2 + Math.random() * 0.15;
    const landingAngle = result.endAngle - result.sweep * landingRatio;

    const startRotation = rotationRef.current;
    const currentMod = normalizeAngle(startRotation);
    const targetMod = normalizeAngle(-landingAngle);
    const delta = normalizeAngle(targetMod - currentMod);
    const endRotation = startRotation + turns * 360 + delta;

    let startTime = null;
    let lastIndex = findSegmentIndex(segments, startRotation);

    setPhase("spinning");

    const step = (now) => {
      if (startTime === null) startTime = now;

      const progress = Math.min((now - startTime) / duration, 1);
      const rotation =
        startRotation + (endRotation - startRotation) * easeOut(progress);

      applyRotation(rotation);

      const index = findSegmentIndex(segments, rotation);
      if (index !== lastIndex) {
        lastIndex = index;
        tickPointer();
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }

      frameRef.current = null;
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        setPhase("won");
        onRevealRef.current?.(result);
      }, reduced ? 0 : REVEAL_DELAY_MS);
    };

    frameRef.current = requestAnimationFrame(step);
  }, [phase, segments]);

  return { phase, spin, rotorRef, pointerRef };
}
