import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { useTheme } from "./theme-provider";

interface GlobeProps {
  location?: [number, number] | null;
  label?: string | null;
  precise?: boolean;
}

// Projection tuning constants for mapping a [lat, lon] onto the rendered
// cobe globe. cobe centres longitude 0 at phi = 3π/2, so PHI_OFFSET aligns
// our overlay with its internal orientation. SPHERE_SCALE accounts for the
// small inset between the canvas edge and the globe's actual radius.
const PHI_OFFSET = Math.PI * 1.5;
const SPHERE_SCALE = 0.92;

export function InteractiveGlobe({ location, label, precise }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const actualTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : theme;

  const isDark = actualTheme === "dark";

  useEffect(() => {
    if (!canvasRef.current) return;

    let phi   = 0;
    let theta = 0.3;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let rafId: number;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width:  600 * 2,
      height: 600 * 2,
      phi:   0,
      theta: 0.3,
      dark: isDark ? 1 : 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor:   isDark ? [0.3, 0.3, 0.3] : [0.6, 0.65, 0.8],
      markerColor: [0.1, 0.8, 1],
      glowColor:   isDark ? [1, 1, 1] : [0.3, 0.5, 0.9],
      markers: [],
    });

    function positionLabel() {
      const el = labelRef.current;
      const container = containerRef.current;
      if (!el || !container || !location) return;

      const [lat, lon] = location;
      const latR = (lat * Math.PI) / 180;
      const lonR = (lon * Math.PI) / 180;

      // Point on the unit sphere in the globe's local frame.
      const x0 = Math.cos(latR) * Math.sin(lonR);
      const y0 = Math.sin(latR);
      const z0 = Math.cos(latR) * Math.cos(lonR);

      // Rotate around the vertical (Y) axis by the current spin.
      const ph = phi + PHI_OFFSET;
      const cp = Math.cos(ph);
      const sp = Math.sin(ph);
      const x1 = x0 * cp + z0 * sp;
      const z1 = -x0 * sp + z0 * cp;
      const y1 = y0;

      // Apply the camera tilt (rotation around the X axis).
      const ct = Math.cos(theta);
      const st = Math.sin(theta);
      const y2 = y1 * ct + z1 * st;
      const z2 = -y1 * st + z1 * ct;
      const x2 = x1;

      const size = container.clientWidth;
      const R = (size / 2) * SPHERE_SCALE;
      const cx = size / 2;
      const cy = size / 2;
      const sx = cx + x2 * R;
      const sy = cy - y2 * R;

      const visible = z2 > 0;
      el.style.transform = `translate(-50%, -100%) translate(${sx}px, ${sy}px)`;
      // Fade out as the point rotates toward / past the horizon.
      el.style.opacity = visible ? String(Math.min(1, z2 * 3 + 0.15)) : "0";
    }

    function animate() {
      if (!isDragging) phi += 0.003;

      const pulse = location
        ? 0.05 + 0.03 * Math.abs(Math.sin(Date.now() * 0.0025))
        : 0;

      globe.update({
        phi,
        theta,
        markers: location ? [{ location: location!, size: pulse }] : [],
      });

      positionLabel();
      rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);

    const canvas = canvasRef.current;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      phi   += (e.clientX - lastX) * 0.005;
      theta  = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, theta + (e.clientY - lastY) * 0.005));
      lastX  = e.clientX;
      lastY  = e.clientY;
    };
    const onPointerUp = () => { isDragging = false; };

    canvas.addEventListener("pointerdown",  onPointerDown);
    canvas.addEventListener("pointermove",  onPointerMove);
    canvas.addEventListener("pointerup",    onPointerUp);
    canvas.addEventListener("pointerleave", onPointerUp);

    return () => {
      cancelAnimationFrame(rafId);
      globe.destroy();
      canvas.removeEventListener("pointerdown",  onPointerDown);
      canvas.removeEventListener("pointermove",  onPointerMove);
      canvas.removeEventListener("pointerup",    onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerUp);
    };
  }, [isDark, location, label, precise]);

  return (
    <div
      ref={containerRef}
      className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: "none" }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />

      {location && (
        <div
          ref={labelRef}
          className="pointer-events-none absolute left-0 top-0 z-20 will-change-transform"
          style={{ transition: "opacity 200ms ease" }}
        >
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-black/75 px-3 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
              </span>
              {label || "You are here"}
              {precise && (
                <span className="ml-0.5 rounded-sm bg-cyan-400/20 px-1 text-[9px] uppercase tracking-wide text-cyan-300">
                  GPS
                </span>
              )}
            </div>
            {/* connector stem down to the anchor point on the globe */}
            <span className="h-2 w-px bg-white/40" />
          </div>
        </div>
      )}
    </div>
  );
}
