"use client";

import { useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { useUserStore } from "@/store/user-store";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const { user } = useUserStore();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const getThemeColors = () => {
      // Get computed CSS variables based on current theme
      const computedStyle = getComputedStyle(document.documentElement);
      return [
        `hsl(${computedStyle.getPropertyValue('--particle-color-1')})`,
        `hsl(${computedStyle.getPropertyValue('--particle-color-2')})`,
        `hsl(${computedStyle.getPropertyValue('--particle-color-3')})`
      ];
    };
    
    // Initialize particles
    const initParticles = () => {
      particles = [];
      const colors = getThemeColors();
      
      const particleCount = Math.min(50, Math.max(20, Math.floor(window.innerWidth * window.innerHeight / 20000)));
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };
    
    // Update and draw particles
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.3; // Transparent particles
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, user]); // Re-init when theme or user changes
  
  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}