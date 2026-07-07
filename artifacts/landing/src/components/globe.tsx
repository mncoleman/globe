import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { useTheme } from "./theme-provider";

interface GlobeProps {
  location?: [number, number] | null;
}

export function InteractiveGlobe({ location }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  const actualTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : theme;

  const isDark = actualTheme === "dark";

  useEffect(() => {
    if (!canvasRef.current) return;

    let phi = 0;
    let isDragging = false;
    let lastX = 0;
    let rafId: number;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0.3,
      dark: isDark ? 1 : 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: isDark ? [0.3, 0.3, 0.3] : [0.6, 0.65, 0.8],
      markerColor: [0.1, 0.8, 1],
      glowColor: isDark ? [1, 1, 1] : [0.3, 0.5, 0.9],
      markers: location ? [{ location, size: 0.08 }] : [],
    });

    function animate() {
      if (!isDragging) phi += 0.003;

      const pulse = location
        ? 0.06 + 0.03 * Math.abs(Math.sin(Date.now() * 0.003))
        : 0;

      globe.update({
        phi,
        markers: location ? [{ location: location!, size: pulse }] : [],
      });

      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);

    const canvas = canvasRef.current;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      phi += (e.clientX - lastX) * 0.005;
      lastX = e.clientX;
    };
    const onPointerUp = () => { isDragging = false; };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerUp);

    return () => {
      cancelAnimationFrame(rafId);
      globe.destroy();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerUp);
    };
  }, [isDark, location]);

  return (
    <div
      className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: "none" }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
