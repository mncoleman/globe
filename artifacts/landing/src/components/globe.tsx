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
      globe.update({ phi, markers: location ? [{ location: location!, size: 0.08 }] : [] });
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);

    const canvas = canvasRef.current;

    const onMouseDown = (e: MouseEvent) => { isDragging = true; lastX = e.clientX; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      phi += (e.clientX - lastX) * 0.005;
      lastX = e.clientX;
    };
    const onMouseUp = () => { isDragging = false; };

    const onTouchStart = (e: TouchEvent) => { isDragging = true; lastX = e.touches[0].clientX; };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      phi += (e.touches[0].clientX - lastX) * 0.005;
      lastX = e.touches[0].clientX;
    };
    const onTouchEnd = () => { isDragging = false; };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(rafId);
      globe.destroy();
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDark, location]);

  return (
    <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] flex items-center justify-center cursor-grab active:cursor-grabbing">
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
