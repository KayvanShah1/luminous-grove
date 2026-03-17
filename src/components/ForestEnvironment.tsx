import { useEffect, useRef } from "react";

interface Firefly {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  drift: number;
  opacity: number;
}

const ForestEnvironment = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    let animFrame: number;
    const fireflies: Firefly[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create fireflies
    for (let i = 0; i < 60; i++) {
      fireflies.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        phase: Math.random() * Math.PI * 2,
        drift: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.6 + 0.2,
      });
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = time / 1000;

      // Draw fog layers
      const fogGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.7, 0,
        canvas.width / 2, canvas.height * 0.7, canvas.width * 0.6
      );
      fogGrad.addColorStop(0, "hsla(180, 30%, 20%, 0.04)");
      fogGrad.addColorStop(0.5, "hsla(150, 20%, 15%, 0.02)");
      fogGrad.addColorStop(1, "transparent");
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw fireflies
      for (const f of fireflies) {
        const pulse = Math.sin(t * f.speed * 2 + f.phase) * 0.5 + 0.5;
        const alpha = f.opacity * pulse;

        f.y -= f.speed * 0.3;
        f.x += Math.sin(t * 0.5 + f.phase) * f.drift;

        if (f.y < -10) { f.y = canvas.height + 10; f.x = Math.random() * canvas.width; }
        if (f.x < -10) f.x = canvas.width + 10;
        if (f.x > canvas.width + 10) f.x = -10;

        // Glow
        const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 8);
        glow.addColorStop(0, `hsla(160, 100%, 70%, ${alpha * 0.3})`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fillRect(f.x - f.size * 8, f.y - f.size * 8, f.size * 16, f.size * 16);

        // Core
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(150, 100%, 75%, ${alpha})`;
        ctx.fill();
      }

      // Ambient light beams
      for (let i = 0; i < 3; i++) {
        const beamX = canvas.width * (0.2 + i * 0.3) + Math.sin(t * 0.1 + i) * 50;
        const beamGrad = ctx.createLinearGradient(beamX, 0, beamX + 30, canvas.height);
        beamGrad.addColorStop(0, "hsla(180, 40%, 50%, 0.01)");
        beamGrad.addColorStop(0.3, "hsla(180, 40%, 50%, 0.015)");
        beamGrad.addColorStop(1, "transparent");
        ctx.fillStyle = beamGrad;
        ctx.fillRect(beamX - 15, 0, 30, canvas.height);
      }

      animFrame = requestAnimationFrame(draw);
    };

    animFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export default ForestEnvironment;
