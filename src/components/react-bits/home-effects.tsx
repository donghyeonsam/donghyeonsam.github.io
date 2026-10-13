"use client";

// Adapted from React Bits by David Haz: https://github.com/DavidHDev/react-bits
// BlurText, FadeContent, ScrollReveal and SpotlightCard; license in this directory.
// Motion replaces GSAP for FadeContent and ScrollReveal; SSR content stays visible without JS.
import {
  motion,
  useInView,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, type ReactNode, type PointerEvent } from "react";

import styles from "./home-effects.module.css";

export function BlurText({ text, className = "", delay = 0 }: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const reduceMotion = useReducedMotion();

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((word, index, words) => (
          <span key={index}>
            <motion.span
              className={styles.word}
              initial={false}
              animate={inView && !reduceMotion ? {
                filter: ["blur(8px)", "blur(3px)", "blur(0px)"],
                opacity: [0, 0.6, 1],
                y: [18, -2, 0],
              } : { filter: "blur(0px)", opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: delay + index * 0.09, times: [0, 0.45, 1], ease: "easeOut" }}
            >
              {word}
            </motion.span>
            {index < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </span>
  );
}

export function FadeContent({ children, className = "", delay = 0 }: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`${styles.reveal} ${className}`}
      initial={false}
      whileInView={reduceMotion ? { opacity: 1, y: 0 } : { opacity: [0, 1], y: [20, 0] }}
      viewport={{ once: true, amount: "some", margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * 스크롤에 맞춰 글자가 흐린 상태에서 선명해진다. 한글 제목은 단어가 적어 글자 단위로 드러내고,
 * 줄바꿈은 단어 단위로 유지한다.
 */
export function ScrollReveal({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "start 0.6"] });
  const words = text.split(" ");
  const total = words.join("").length;
  let index = 0;

  return (
    <span ref={ref}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <span key={w}>
            <span className="inline-block whitespace-nowrap">
              {Array.from(word).map((char, c) => (
                <RevealChar key={c} char={char} progress={scrollYProgress} start={(index++ / total) * 0.6} />
              ))}
            </span>
            {w < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </span>
  );
}

function RevealChar({ char, progress, start }: { char: string; progress: MotionValue<number>; start: number }) {
  const opacity = useTransform(progress, [start, start + 0.4], [0.15, 1]);
  const blur = useTransform(progress, [start, start + 0.4], [4, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  return (
    // 움직임 줄이기에서는 .word 규칙이 opacity·filter를 덮어 바로 보이게 한다.
    <motion.span className={styles.word} style={{ opacity, filter }}>
      {char}
    </motion.span>
  );
}

export function SpotlightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    ref.current.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  }

  return (
    <div ref={ref} onPointerMove={handlePointerMove} className={`${styles.spotlight} ${className}`}>
      {children}
      <span aria-hidden="true" className={styles.light} />
    </div>
  );
}
