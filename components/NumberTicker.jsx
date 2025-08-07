"use client";

import { useEffect, useRef, useState } from "react";

export default function NumberTicker({
  value,
  start = 0,
  duration = 1200,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  formatter,
}) {
  const [display, setDisplay] = useState(start);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const fromRef = useRef(start);
  const toRef = useRef(value);

  // ease-out cubic
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  useEffect(() => {
    // re-run when value changes
    fromRef.current = display; // continue from current number
    toRef.current = value;

    const animate = (ts) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = ease(t);

      const next =
        fromRef.current + (toRef.current - fromRef.current) * eased;

      setDisplay(next);

      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };

    const id = setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
      startTimeRef.current = null;
      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(id);
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, delay]); // re-animate on these changes

  const formatted =
    typeof formatter === "function"
      ? formatter(display)
      : `${prefix}${Number(display).toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}${suffix}`;

  return <span className={className}>{formatted}+</span>;
}
