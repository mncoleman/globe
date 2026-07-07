import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { useTheme } from "./theme-provider";

interface GlobeProps {
  location?: [number, number] | null;
}

export function InteractiveGlobe({ location }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, setTheme } = useTheme();

  // Resolve actual theme for rendering
  const actualTheme = 
    theme === "system" 
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;

  const isDark = actualTheme === "dark";

  useEffect(() => {
    let phi = 0;
    let isDragging = false;
    let lastX = 0;
    
    if (!canvasRef.current) return;
    
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0.3,
      dark: isDark ? 1 : 0,
      diffuse: 1.4,
      mapSamples: 16000,
      mapBrightness: isDark ? 8 : 6,
      baseColor: isDark ? [0.15, 0.25, 0.5] : [0.75, 0.8, 0.95],
      markerColor: [0.1, 0.85, 1],
      glowColor: isDark ? [0.4, 0.65, 1] : [0.3, 0.5, 0.9],
      markers: location ? [{ location, size: 0.08 }] : [],
      onRender: (state) => {
        if (!isDragging) phi += 0.003;
        state.phi = phi;
      }
    });
    
    const canvas = canvasRef.current;
    const onMouseDown = (e: MouseEvent) => { isDragging = true; lastX = e.clientX; };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      phi += (e.clientX - lastX) * 0.005;
      lastX = e.clientX;
    };
    const onMouseUp = () => { isDragging = false; };
    
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    
    // Add touch support
    const onTouchStart = (e: TouchEvent) => { isDragging = true; lastX = e.touches[0].clientX; };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      phi += (e.touches[0].clientX - lastX) * 0.005;
      lastX = e.touches[0].clientX;
    };
    const onTouchEnd = () => { isDragging = false; };

    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
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
    <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] flex items-center justify-center cursor-grab active:cursor-grabbing relative">
      <canvas 
        ref={canvasRef} 
        style={{ width: "100%", height: "100%", contain: "layout paint size" }} 
      />
    </div>
  );
}
