import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import styles from "./Confetti.module.css";

const COLORS = ["#0f62fe", "#cae4ff", "#ffc803", "#f97351", "#2ac96d", "#ffffff", "#083b99"];
const DURATION_MS = 3600;
const GRAVITY = 0.32;
const DRAG = 0.985;

function random(min, max) {
  return min + Math.random() * (max - min);
}

function createBurst({ x, y, count, angle, spread, speed }) {
  return Array.from({ length: count }, () => {
    const direction = ((angle + random(-spread, spread)) * Math.PI) / 180;
    const velocity = random(speed * 0.55, speed);

    return {
      x,
      y,
      vx: Math.cos(direction) * velocity,
      vy: Math.sin(direction) * velocity,
      size: random(6, 11),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() < 0.3 ? "circle" : "rect",
      rotation: random(0, Math.PI * 2),
      spin: random(-0.25, 0.25),
      wobble: random(0, Math.PI * 2),
    };
  });
}

// 당첨 순간 화면 전체에 터지는 폭죽임. 마운트되면 한 번 터지고 끝남.
// 모달 패널은 overflow가 걸려 있어서 body에 따로 그림.
function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return undefined;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const ratio = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.scale(ratio, ratio);

    // 가운데에서 "팡" 한 번 + 양쪽 아래에서 대포처럼 쏘아 올림.
    const particles = [
      ...createBurst({ x: width / 2, y: height * 0.42, count: 110, angle: -90, spread: 180, speed: 15 }),
      ...createBurst({ x: 0, y: height, count: 70, angle: -62, spread: 16, speed: 26 }),
      ...createBurst({ x: width, y: height, count: 70, angle: -118, spread: 16, speed: 26 }),
    ];

    let frameId = null;
    let startTime = null;

    const draw = (now) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const fade = Math.max(0, 1 - Math.max(0, elapsed - DURATION_MS * 0.6) / (DURATION_MS * 0.4));

      context.clearRect(0, 0, width, height);
      context.globalAlpha = fade;

      particles.forEach((particle) => {
        particle.vx *= DRAG;
        particle.vy = particle.vy * DRAG + GRAVITY;
        particle.wobble += 0.12;
        particle.x += particle.vx + Math.sin(particle.wobble) * 0.6;
        particle.y += particle.vy;
        particle.rotation += particle.spin;

        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.fillStyle = particle.color;

        if (particle.shape === "circle") {
          context.beginPath();
          context.arc(0, 0, particle.size / 2.4, 0, Math.PI * 2);
          context.fill();
        } else {
          // 종이가 뒤집히는 느낌을 주려고 세로 길이를 출렁이게 함.
          const flip = Math.abs(Math.cos(particle.wobble));
          context.fillRect(-particle.size / 2, (-particle.size * flip) / 3, particle.size, (particle.size * flip) / 1.5);
        }

        context.restore();
      });

      if (elapsed < DURATION_MS) {
        frameId = requestAnimationFrame(draw);
      } else {
        context.clearRect(0, 0, width, height);
      }
    };

    frameId = requestAnimationFrame(draw);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />,
    document.body,
  );
}

export default Confetti;
