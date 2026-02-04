"use client";

import { useEffect, useRef } from "react";

interface GalaxyBackgroundProps {
  starCount?: number;
  starColor?: [number, number, number];
  starSize?: number;
  speed?: number;
  className?: string;
}

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export default function GalaxyBackground({
  starCount = 200,
  starColor = [255, 200, 100], // Gold-ish to match your brand
  starSize = 2,
  speed = 0.3,
  className = "",
}: GalaxyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    const createStars = () => {
      starsRef.current = [];
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width - canvas.width / 2,
          y: Math.random() * canvas.height - canvas.height / 2,
          z: Math.random() * canvas.width,
          size: Math.random() * starSize + 0.5,
          opacity: Math.random(),
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left - rect.width / 2) / rect.width,
        y: (e.clientY - rect.top - rect.height / 2) / rect.height,
      };
    };

    resize();
    createStars();

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);

    let time = 0;

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      time += 0.016; // ~60fps

      // Sort stars by z for depth effect
      starsRef.current.sort((a, b) => b.z - a.z);

      starsRef.current.forEach((star) => {
        // Move stars towards camera
        star.z -= speed;

        // Reset star if it goes past camera
        if (star.z <= 0) {
          star.z = canvas.width;
          star.x = Math.random() * canvas.width - canvas.width / 2;
          star.y = Math.random() * canvas.height - canvas.height / 2;
        }

        // Project 3D to 2D with perspective
        const perspective = canvas.width / star.z;
        const projX = star.x * perspective + centerX;
        const projY = star.y * perspective + centerY;

        // Add subtle mouse parallax
        const parallaxX = mouseRef.current.x * (star.z / canvas.width) * 20;
        const parallaxY = mouseRef.current.y * (star.z / canvas.width) * 20;

        const finalX = projX + parallaxX;
        const finalY = projY + parallaxY;

        // Check if star is visible
        if (
          finalX < 0 ||
          finalX > canvas.width ||
          finalY < 0 ||
          finalY > canvas.height
        ) {
          return;
        }

        // Calculate size based on distance
        const size = star.size * perspective * 0.5;

        // Twinkle effect
        const twinkle =
          Math.sin(time * star.twinkleSpeed * 100 + star.twinklePhase) * 0.3 +
          0.7;
        const finalOpacity =
          star.opacity * twinkle * Math.min(1, (canvas.width - star.z) / 200);

        // Draw star with glow
        const gradient = ctx.createRadialGradient(
          finalX,
          finalY,
          0,
          finalX,
          finalY,
          size * 3
        );
        gradient.addColorStop(
          0,
          `rgba(${starColor[0]}, ${starColor[1]}, ${starColor[2]}, ${finalOpacity})`
        );
        gradient.addColorStop(
          0.4,
          `rgba(${starColor[0]}, ${starColor[1]}, ${starColor[2]}, ${finalOpacity * 0.4})`
        );
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(finalX, finalY, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw bright center
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity * 0.8})`;
        ctx.arc(finalX, finalY, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw subtle nebula clouds
      const nebulaGradient = ctx.createRadialGradient(
        centerX + Math.sin(time * 0.2) * 50,
        centerY + Math.cos(time * 0.15) * 30,
        0,
        centerX,
        centerY,
        canvas.width * 0.6
      );
      nebulaGradient.addColorStop(
        0,
        `rgba(${starColor[0]}, ${starColor[1]}, ${starColor[2]}, 0.03)`
      );
      nebulaGradient.addColorStop(0.5, "rgba(100, 50, 150, 0.02)");
      nebulaGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = nebulaGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, [starCount, starColor, starSize, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-auto absolute inset-0 ${className}`}
      style={{ mixBlendMode: "screen" }}
    />
  );
}