"use client";

// Adapted from React Bits Noise by David Haz: https://github.com/DavidHDev/react-bits
// License in this directory. 필름 그레인만 남기고 움직이지 않게 했다.
import { useEffect, useRef } from "react";

import styles from "./noise.module.css";

const TILE = 256;

/** 고정 시드로 회색 노이즈 타일을 한 번 그려 data URL로 돌려준다. */
function paintTile(contrast: number) {
  const canvas = document.createElement("canvas");
  canvas.width = TILE;
  canvas.height = TILE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const image = ctx.createImageData(TILE, TILE);
  let state = 1013904223;
  const random = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const range = 0.5 + contrast * 1.1;
  for (let i = 0; i < image.data.length; i += 4) {
    const value = Math.min(1, Math.max(0, 0.5 + (random() + random() - 1) * range)) * 255;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = value;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

/** 화면 전체에 얹는 정지된 종이 질감. 클릭은 통과시킨다. */
export default function Noise({ opacity = 0.05, contrast = 0.5 }: { opacity?: number; contrast?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = paintTile(contrast);
    if (url && ref.current) ref.current.style.backgroundImage = `url(${url})`;
  }, [contrast]);

  return (
    <div aria-hidden="true" className={styles.root} style={{ opacity }}>
      <div ref={ref} className={styles.grain} />
    </div>
  );
}
