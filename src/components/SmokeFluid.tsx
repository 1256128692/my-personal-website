"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

export default function SmokeFluid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, lastX: 0, lastY: 0 });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouseRef.current.lastX;
      const dy = e.clientY - mouseRef.current.lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      mouseRef.current.vx = dx * 0.5;
      mouseRef.current.vy = dy * 0.5;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;

      // Spawn more particles when moving faster
      const particleCount = Math.min(20, Math.max(5, Math.floor(speed * 0.3 + 5)));

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spread = speed * 0.3 + 30;

        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * spread,
          y: e.clientY + (Math.random() - 0.5) * spread,
          vx: Math.cos(angle) * (Math.random() * 3 + 1) + mouseRef.current.vx * 0.5,
          vy: Math.sin(angle) * (Math.random() * 3 + 1) + mouseRef.current.vy * 0.5,
          life: 0,
          maxLife: 40 + Math.random() * 40,
          size: 20 + Math.random() * 40 + speed * 0.3,
          hue: 220 + Math.random() * 60,
        });
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life += 1 / p.maxLife;

        const alpha = Math.max(0, 1 - p.life) * 0.25;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 65%, ${alpha})`);
        gradient.addColorStop(0.5, `hsla(${p.hue + 30}, 70%, 55%, ${alpha * 0.4})`);
        gradient.addColorStop(1, `hsla(${p.hue + 50}, 60%, 45%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        return p.life < 1;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
