import { useEffect, useRef } from 'react';

export default function CursorGlow() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const pos = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();

    const render = () => {
      // Smooth interpolation (Magnetism/Lag)
      const easedX = pos.current.x + (mouse.current.x - pos.current.x) * 0.064;
      const easedY = pos.current.y + (mouse.current.y - pos.current.y) * 0.064;
      pos.current = { x: easedX, y: easedY };

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (pos.current.x > -500) {
        const radius = 600;
        const gradient = ctx.createRadialGradient(
          pos.current.x, pos.current.y, 0,
          pos.current.x, pos.current.y, radius
        );
        
        // Midnight Emerald Glow
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
        gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.06)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.current.x, pos.current.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner Core Glow
        const coreGradient = ctx.createRadialGradient(
          pos.current.x, pos.current.y, 0,
          pos.current.x, pos.current.y, 180
        );
        coreGradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
        coreGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(pos.current.x, pos.current.y, 180, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-30 pointer-events-none opacity-60" 
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
