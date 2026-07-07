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
          <div className="relative flex flex-col items-center">
            {/* label pill */}
            <div className="mb-1 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-black/75 px-3 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-md">
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

            {/* 3D map pin — tip sits at the anchor point on the globe */}
            <div className="pin-bob">
              <Pin3D />
            </div>

            {/* ground shadow anchored at the tip, breathing with the float */}
            <span className="pin-shadow absolute -bottom-[3px] left-1/2 -z-10 h-[5px] w-5 -translate-x-1/2 rounded-[50%] bg-black/70 blur-[2px]" />
          </div>
        </div>
      )}
    </div>
  );
}

// Glossy 3D teardrop map-pin. Vertical gradient + top-left gloss highlight +
// recessed dark hole + drop shadow give it depth; the tip is at the bottom.
function Pin3D() {
  return (
    <svg
      width="34"
      height="46"
      viewBox="0 0 34 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.35))" }}
    >
      <defs>
        <linearGradient id="pinBody" x1="8" y1="2" x2="26" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a5f3fc" />
          <stop offset="0.45" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
        <radialGradient
          id="pinGloss"
          cx="0" cy="0" r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(12 11) rotate(58) scale(13)"
        >
          <stop stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient
          id="pinHole"
          cx="0" cy="0" r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(17 16.5) scale(7)"
        >
          <stop stopColor="#0b3a44" />
          <stop offset="1" stopColor="#062730" />
        </radialGradient>
      </defs>
      {/* body */}
      <path
        d="M17 44.5C10 32 3.5 25.5 3.5 15.5A13.5 13.5 0 1 1 30.5 15.5C30.5 25.5 24 32 17 44.5Z"
        fill="url(#pinBody)"
        stroke="#0891b2"
        strokeWidth="0.75"
      />
      {/* gloss highlight */}
      <path
        d="M17 44.5C10 32 3.5 25.5 3.5 15.5A13.5 13.5 0 1 1 30.5 15.5C30.5 25.5 24 32 17 44.5Z"
        fill="url(#pinGloss)"
      />
      {/* recessed hole */}
      <circle cx="17" cy="16.5" r="6.2" fill="url(#pinHole)" />
      <circle cx="17" cy="16.5" r="6.2" fill="none" stroke="#083b46" strokeWidth="0.6" />
      {/* specular dot */}
      <circle cx="14.6" cy="14" r="1.5" fill="#67e8f9" opacity="0.85" />
    </svg>
  );
}
