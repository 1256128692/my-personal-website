"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Expression = "normal" | "confused" | "shy" | "angry";

export default function OtterMascot() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPupilRef = useRef({ x: 0, y: 0 });
  const rightPupilRef = useRef({ x: 0, y: 0 });
  const targetPupilRef = useRef({ x: 0, y: 0 });
  const bodyRotationRef = useRef(0);
  const waveRotationRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [leftPupil, setLeftPupil] = useState({ x: 0, y: 0 });
  const [rightPupil, setRightPupil] = useState({ x: 0, y: 0 });
  const [bodyRotation, setBodyRotation] = useState(0);
  const [expression, setExpression] = useState<Expression>("normal");
  const [isWaving, setIsWaving] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [waveRotation, setWaveRotation] = useState(0);

  // Handle click expression
  const handleClick = useCallback(() => {
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      const count = clickCountRef.current;
      clickCountRef.current = 0;

      if (count >= 5) {
        setExpression("angry");
        setIsShaking(true);
        setTimeout(() => {
          setExpression("normal");
          setIsShaking(false);
        }, 1500);
      } else if (count >= 3) {
        setExpression("shy");
        setIsWaving(true);
        setTimeout(() => {
          setExpression("normal");
          setIsWaving(false);
        }, 2000);
      } else if (count === 1) {
        setExpression("confused");
        setTimeout(() => {
          setExpression("normal");
        }, 1000);
      }
    }, 400);
  }, []);

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const otterCenterX = rect.left + rect.width / 2;
      const otterCenterY = rect.top + rect.height * 0.4;

      const dx = e.clientX - otterCenterX;
      const dy = e.clientY - otterCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const maxMove = 2.5;
      if (distance > 0) {
        targetPupilRef.current.x = (dx / distance) * Math.min(maxMove, distance * 0.02);
        targetPupilRef.current.y = (dy / distance) * Math.min(maxMove, distance * 0.02);
      }

      const speedX = e.clientX - lastX;
      if (Math.abs(speedX) > 5) {
        bodyRotationRef.current = Math.max(-10, Math.min(10, speedX * 0.3));
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };

    let wavePhase = 0;

    const animate = () => {
      // Lerp pupil
      const lerp = 0.15;
      leftPupilRef.current.x += (targetPupilRef.current.x - leftPupilRef.current.x) * lerp;
      leftPupilRef.current.y += (targetPupilRef.current.y - leftPupilRef.current.y) * lerp;
      rightPupilRef.current.x += (targetPupilRef.current.x - rightPupilRef.current.x) * lerp;
      rightPupilRef.current.y += (targetPupilRef.current.y - rightPupilRef.current.y) * lerp;

      // Decay body rotation
      bodyRotationRef.current *= 0.92;

      // Wave animation
      if (isWaving) {
        wavePhase += 0.15;
        waveRotationRef.current = Math.sin(wavePhase) * 25;
      } else {
        waveRotationRef.current *= 0.9;
      }

      setLeftPupil({ ...leftPupilRef.current });
      setRightPupil({ ...rightPupilRef.current });
      setBodyRotation(bodyRotationRef.current);
      setWaveRotation(waveRotationRef.current);

      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, [isWaving]);

  // Get expression-specific features
  const getExpressionStyle = () => {
    switch (expression) {
      case "confused":
        return {
          leftEye: { scaleX: 1.2, scaleY: 0.8 },
          rightEye: { scaleX: 1.2, scaleY: 0.8 },
          mouth: "M44 55 Q50 52 56 55",
          eyebrowLeft: { rotate: -15, y: 28 },
          eyebrowRight: { rotate: 15, y: 28 },
          body: { hue: 30 },
        };
      case "shy":
        return {
          leftEye: { scaleX: 0.3, scaleY: 0.5 },
          rightEye: { scaleX: 0.3, scaleY: 0.5 },
          mouth: "M47 55 Q50 53 53 55",
          eyebrowLeft: { rotate: 0, y: 30 },
          eyebrowRight: { rotate: 0, y: 30 },
          body: { hue: 0 },
          blush: true,
        };
      case "angry":
        return {
          leftEye: { scaleX: 1, scaleY: 1 },
          rightEye: { scaleX: 1, scaleY: 1 },
          mouth: "M44 56 Q50 52 56 56",
          eyebrowLeft: { rotate: 25, y: 30 },
          eyebrowRight: { rotate: -25, y: 30 },
          body: { hue: 0 },
          steam: true,
        };
      default:
        return {
          leftEye: { scaleX: 1, scaleY: 1 },
          rightEye: { scaleX: 1, scaleY: 1 },
          mouth: "M46 53 Q50 57 54 53",
          eyebrowLeft: { rotate: 0, y: 32 },
          eyebrowRight: { rotate: 0, y: 32 },
          body: { hue: 0 },
        };
    }
  };

  const style = getExpressionStyle();

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 z-40 cursor-pointer"
      onClick={handleClick}
      style={{
        transform: `rotate(${bodyRotation}deg) ${isShaking ? "translateX(2px)" : ""}`,
        transition: isShaking ? "none" : "transform 0.1s ease-out",
      }}
    >
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-2xl"
        style={{
          filter: "drop-shadow(4px 4px 8px rgba(0,0,0,0.4))",
        }}
      >
        {/* 3D Body with gradient */}
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6B5B47" />
            <stop offset="50%" stopColor="#5D4E37" />
            <stop offset="100%" stopColor="#4A3F2E" />
          </linearGradient>
          <linearGradient id=" bellyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9B8B75" />
            <stop offset="100%" stopColor="#8B7B65" />
          </linearGradient>
          <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6B5B47" />
            <stop offset="50%" stopColor="#5D4E37" />
            <stop offset="100%" stopColor="#4A3F2E" />
          </linearGradient>
          <radialGradient id="noseGradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#5D4E37" />
            <stop offset="100%" stopColor="#3D2E1F" />
          </radialGradient>
        </defs>

        {/* Body */}
        <ellipse cx="60" cy="82" rx="32" ry="26" fill="url(#bodyGradient)" />

        {/* Belly */}
        <ellipse cx="60" cy="85" rx="20" ry="16" fill="url(#bellyGradient)" />

        {/* Head */}
        <ellipse cx="60" cy="50" rx="32" ry="28" fill="url(#headGradient)" />

        {/* Face highlight (3D effect) */}
        <ellipse cx="50" cy="42" rx="20" ry="16" fill="#7B6B57" opacity="0.3" />

        {/* Muzzle */}
        <ellipse cx="60" cy="58" rx="16" ry="12" fill="#C4A574" />

        {/* Left ear */}
        <ellipse cx="32" cy="30" rx="10" ry="10" fill="#5D4E37" />
        <ellipse cx="32" cy="30" rx="6" ry="6" fill="#8B7B65" />

        {/* Right ear */}
        <ellipse cx="88" cy="30" rx="10" ry="10" fill="#5D4E37" />
        <ellipse cx="88" cy="30" rx="6" ry="6" fill="#8B7B65" />

        {/* Left eyebrow */}
        <line
          x1="40"
          y1={style.eyebrowLeft.y}
          x2="52"
          y2={style.eyebrowLeft.y - 2}
          stroke="#3D2E1F"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transform: `rotate(${style.eyebrowLeft.rotate}deg)`,
            transformOrigin: `${40}px ${style.eyebrowLeft.y}px`,
          }}
        />

        {/* Right eyebrow */}
        <line
          x1="80"
          y1={style.eyebrowRight.y}
          x2="68"
          y2={style.eyebrowRight.y - 2}
          stroke="#3D2E1F"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transform: `rotate(${style.eyebrowRight.rotate}deg)`,
            transformOrigin: `${80}px ${style.eyebrowRight.y}px`,
          }}
        />

        {/* Left eye socket */}
        <ellipse cx="45" cy="45" rx="10" ry="10" fill="#1a1a1a" />
        {/* Left eye white */}
        <ellipse cx="45" cy="45" rx="7" ry="7" fill="#ffffff" />
        {/* Left pupil */}
        <ellipse
          cx={45 + leftPupil.x}
          cy={45 + leftPupil.y}
          rx={3 * style.leftEye.scaleX}
          ry={3 * style.leftEye.scaleY}
          fill="#1a1a1a"
        />
        {/* Left eye shine */}
        <ellipse
          cx={43 + leftPupil.x}
          cy={43 + leftPupil.y}
          rx="1.8"
          ry="1.8"
          fill="#ffffff"
          opacity="0.9"
        />

        {/* Right eye socket */}
        <ellipse cx="75" cy="45" rx="10" ry="10" fill="#1a1a1a" />
        {/* Right eye white */}
        <ellipse cx="75" cy="45" rx="7" ry="7" fill="#ffffff" />
        {/* Right pupil */}
        <ellipse
          cx={75 + rightPupil.x}
          cy={45 + rightPupil.y}
          rx={3 * style.rightEye.scaleX}
          ry={3 * style.rightEye.scaleY}
          fill="#1a1a1a"
        />
        {/* Right eye shine */}
        <ellipse
          cx={73 + rightPupil.x}
          cy={43 + rightPupil.y}
          rx="1.8"
          ry="1.8"
          fill="#ffffff"
          opacity="0.9"
        />

        {/* Nose */}
        <ellipse cx="60" cy="55" rx="5" ry="4" fill="url(#noseGradient)" />

        {/* Mouth */}
        <path
          d={style.mouth}
          stroke="#3D2E1F"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Blush marks for shy */}
        {style.blush && (
          <>
            <ellipse cx="35" cy="55" rx="6" ry="4" fill="#FF6B6B" opacity="0.5" />
            <ellipse cx="85" cy="55" rx="6" ry="4" fill="#FF6B6B" opacity="0.5" />
          </>
        )}

        {/* Steam for angry */}
        {style.steam && (
          <>
            <path d="M30 20 Q35 10 30 0" stroke="#888" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M40 18 Q45 8 40 -2" stroke="#888" strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M90 20 Q85 10 90 0" stroke="#888" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M80 18 Q75 8 80 -2" stroke="#888" strokeWidth="2" fill="none" opacity="0.5" />
          </>
        )}

        {/* Whiskers */}
        <line x1="35" y1="58" x2="20" y2="55" stroke="#C4A574" strokeWidth="1" strokeLinecap="round" />
        <line x1="35" y1="60" x2="20" y2="62" stroke="#C4A574" strokeWidth="1" strokeLinecap="round" />
        <line x1="35" y1="62" x2="22" y2="68" stroke="#C4A574" strokeWidth="1" strokeLinecap="round" />
        <line x1="85" y1="58" x2="100" y2="55" stroke="#C4A574" strokeWidth="1" strokeLinecap="round" />
        <line x1="85" y1="60" x2="100" y2="62" stroke="#C4A574" strokeWidth="1" strokeLinecap="round" />
        <line x1="85" y1="62" x2="98" y2="68" stroke="#C4A574" strokeWidth="1" strokeLinecap="round" />

        {/* Left paw with wave animation */}
        <g style={{
          transform: `rotate(${waveRotation}deg)`,
          transformOrigin: "35px 105px",
          transition: isWaving ? "none" : "transform 0.1s ease-out",
        }}>
          <ellipse cx="35" cy="105" rx="10" ry="7" fill="#5D4E37" />
          <ellipse cx="30" cy="108" rx="3" ry="4" fill="#4A3F2E" />
          <ellipse cx="35" cy="110" rx="3" ry="4" fill="#4A3F2E" />
          <ellipse cx="40" cy="108" rx="3" ry="4" fill="#4A3F2E" />
        </g>

        {/* Right paw */}
        <ellipse cx="85" cy="105" rx="10" ry="7" fill="#5D4E37" />

        {/* Question mark for confused */}
        {expression === "confused" && (
          <text x="90" y="35" fontSize="20" fill="#FFD700" fontWeight="bold">?</text>
        )}

        {/* Exclamation for angry */}
        {expression === "angry" && (
          <text x="25" y="25" fontSize="18" fill="#FF4444" fontWeight="bold">!</text>
        )}

        {/* Water drops */}
        <ellipse cx="100" cy="25" rx="4" ry="5" fill="#4FC3F7" opacity="0.6" />
        <ellipse cx="106" cy="35" rx="3" ry="4" fill="#4FC3F7" opacity="0.4" />
        <ellipse cx="15" cy="20" rx="3" ry="4" fill="#4FC3F7" opacity="0.5" />
      </svg>

      {/* Expression text tooltip */}
      {expression !== "normal" && (
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
          style={{
            backgroundColor: expression === "angry" ? "#FF4444" : expression === "shy" ? "#FF69B4" : "#FFD700",
            color: expression === "angry" ? "#fff" : "#333",
          }}
        >
          {expression === "confused" && "疑惑??"}
          {expression === "shy" && "害羞~"}
          {expression === "angry" && "生气!"}
        </div>
      )}
    </div>
  );
}
