import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
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

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Spawn spark particles on movement
      if (Math.random() < 0.3) {
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          alpha: 1.0,
          size: Math.random() * 2 + 1
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x, y } = mouseRef.current;

      // Update and draw particles (sparks)
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03; // Fade out

        if (p.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#39ff14'; // Acid Green sparks
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      });

      // Draw custom Acid Green crosshair cursor
      ctx.save();
      ctx.strokeStyle = '#39ff14';
      ctx.lineWidth = 1.5;

      // Outer ring
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshairs lines
      ctx.beginPath();
      // Top
      ctx.moveTo(x, y - 12);
      ctx.lineTo(x, y - 4);
      // Bottom
      ctx.moveTo(x, y + 4);
      ctx.lineTo(x, y + 12);
      // Left
      ctx.moveTo(x - 12, y);
      ctx.lineTo(x - 4, y);
      // Right
      ctx.moveTo(x + 4, y);
      ctx.lineTo(x + 12, y);
      ctx.stroke();

      // Center dot
      ctx.fillStyle = '#ffea00'; // Hazard Yellow dot
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-9999"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
