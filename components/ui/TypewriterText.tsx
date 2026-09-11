"use client";

import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  className?: string;
  /** ms between each typed character */
  typeSpeed?: number;
  /** ms between each deleted character */
  deleteSpeed?: number;
  /** ms to wait before typing starts, first pass only */
  startDelay?: number;
  /** ms to hold the fully-typed text before deleting */
  pauseDuration?: number;
  /** ms to hold the empty string before retyping */
  restartDelay?: number;
}

type Phase = "typing" | "pausing" | "deleting" | "restarting";

// Loops: type `text` out in full, hold, delete it back to nothing, hold,
// then retype — forever. One setTimeout chain drives all four phases so
// there's only ever one timer alive at a time.
export default function TypewriterText({
  text,
  className,
  typeSpeed = 100,
  deleteSpeed = 100,
  startDelay = 300,
  pauseDuration = 2500,
  restartDelay = 1000,
}: TypewriterTextProps) {
  const [visibleChars, setVisibleChars] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    setVisibleChars(0);
    setPhase("typing");
  }, [text]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      const delay = visibleChars === 0 ? startDelay : typeSpeed;
      timeout = setTimeout(() => {
        if (visibleChars < text.length) {
          setVisibleChars((n) => n + 1);
        } else {
          setPhase("pausing");
        }
      }, delay);
    } else if (phase === "pausing") {
      timeout = setTimeout(() => setPhase("deleting"), pauseDuration);
    } else if (phase === "deleting") {
      timeout = setTimeout(() => {
        if (visibleChars > 0) {
          setVisibleChars((n) => n - 1);
        } else {
          setPhase("restarting");
        }
      }, deleteSpeed);
    } else {
      timeout = setTimeout(() => setPhase("typing"), restartDelay);
    }

    return () => clearTimeout(timeout);
  }, [phase, visibleChars, text, typeSpeed, deleteSpeed, pauseDuration, restartDelay, startDelay]);

  return (
    <p className={className}>
      {text.slice(0, visibleChars)}
      <span className="inline-block w-[1ch] animate-pulse">|</span>
    </p>
  );
}
