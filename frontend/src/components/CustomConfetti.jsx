import React, { useEffect, useRef, useState } from 'react';

export default function CustomConfetti() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const triggerConfetti = () => {
      const colors = ['#39ff14', '#ffea00', '#ff5500', '#ffffff'];
      const x = window.innerWidth - 300; // Emit near the cargo drawer / navbar icon
      const y = 80;

      for (let i = 0; i < 40; i++) {
        particlesRef.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.7) * 10 - 2, // Shoot upward
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 5 + 3,
          alpha: 1.0,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2
        });
      }
    };

    window.addEventListener('confetti-trigger', triggerConfetti);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // Gravity
        p.alpha -= 0.02;
        p.rotation += p.rotationSpeed;

        if (p.alpha <= 0 || p.y > canvas.height) return false;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        // Draw square confetti pieces
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        
        ctx.restore();
        return true;
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('confetti-trigger', triggerConfetti);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-999"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
