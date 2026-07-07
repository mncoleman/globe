import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { useTheme } from "./theme-provider";

interface GlobeProps {
  location?: [number, number] | null;
}

const MARKER_ID = "user-location";

export function InteractiveGlobe({ location }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<SVGSVGElement>(null);
  const { theme } = useTheme();

  const actualTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  const isDark = actualTheme === "dark";

  useEffect(() => {
    if (!canvasRef.current) return;

    let phi = 0;
    let theta = 0.3;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
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
      markerColor: [0, 0, 0],
      glowColor: isDark ? [1, 1, 1] : [0.3, 0.5, 0.9],
      markers: location ? [{ location, size: 0.001, id: MARKER_ID }] : [],
    });

    function animate() {
      if (!isDragging) phi += 0.003;

      globe.update({
        phi,
        theta,
        markers: location ? [{ location: location!, size: 0.001, id: MARKER_ID }] : [],
      });

      if (overlayRef.current && location) {
        const wrapper = canvasRef.current?.parentElement;
        if (wrapper) {
          const anchor = wrapper.querySelector(
            `[style*="anchor-name:--cobe-${MARKER_ID}"]`
          ) as HTMLElement | null;

          if (anchor) {
            const left = parseFloat(anchor.style.left);
            const top = parseFloat(anchor.style.top);
            overlayRef.current.style.left = `${left}%`;
            overlayRef.current.style.top = `${top}%`;

            const visible = getComputedStyle(document.documentElement)
              .getPropertyValue(`--cobe-visible-${MARKER_ID}`)
              .trim();
            overlayRef.current.style.opacity = visible === "N" ? "1" : "0";
          } else {
            overlayRef.current.style.opacity = "0";
          }
        }
      }

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
      lastX = e.clientX;
      lastY = e.clientY;
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
      ref={containerRef}
      className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px] cursor-grab active:cursor-grabbing select-none relative"
      style={{ touchAction: "none" }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />

      {location && (
        <svg
          ref={overlayRef}
          width="48"
          height="48"
          viewBox="-24 -24 48 48"
          style={{
            position: "absolute",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            opacity: 0,
            transition: "opacity 0.3s ease",
            overflow: "visible",
          }}
        >
          <style>{`
            @keyframes reticle-spin {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
            @keyframes reticle-pulse-1 {
              0%,100% { r: 10; opacity: 0.7; }
              50%     { r: 14; opacity: 0;   }
            }
            @keyframes reticle-pulse-2 {
              0%,100% { r: 14; opacity: 0.4; }
              50%     { r: 20; opacity: 0;   }
            }
            @keyframes reticle-blink {
              0%,100% { opacity: 1; }
              50%     { opacity: 0.3; }
            }
          `}</style>

          {/* Expanding pulse rings */}
          <circle
            cx="0" cy="0" r="10"
            fill="none"
            stroke="rgb(34 211 238)"
            strokeWidth="1"
            style={{ animation: "reticle-pulse-1 2s ease-out infinite" }}
          />
          <circle
            cx="0" cy="0" r="14"
            fill="none"
            stroke="rgb(34 211 238)"
            strokeWidth="0.5"
            style={{ animation: "reticle-pulse-2 2s ease-out infinite 0.4s" }}
          />

          {/* Rotating outer arc segments — unique "reticle" shape */}
          <g style={{ animation: "reticle-spin 8s linear infinite" }}>
            {/* 4 arc segments with gaps — like a radar sweep indicator */}
            {[0, 90, 180, 270].map((deg) => (
              <path
                key={deg}
                d="M 0 -9 A 9 9 0 0 1 6.364 -6.364"
                fill="none"
                stroke="rgb(34 211 238)"
                strokeWidth="1.5"
                strokeLinecap="round"
                transform={`rotate(${deg})`}
              />
            ))}
          </g>

          {/* Static tick marks at cardinal points */}
          {[0, 90, 180, 270].map((deg) => (
            <line
              key={deg}
              x1="0" y1="-12"
              x2="0" y2="-16"
              stroke="rgb(34 211 238)"
              strokeWidth="1"
              strokeLinecap="round"
              transform={`rotate(${deg})`}
              style={{ animation: "reticle-blink 2s ease-in-out infinite" }}
            />
          ))}

          {/* Inner cross */}
          <line x1="-4" y1="0" x2="-2" y2="0" stroke="rgb(34 211 238)" strokeWidth="1" strokeLinecap="round" />
          <line x1="2"  y1="0" x2="4"  y2="0" stroke="rgb(34 211 238)" strokeWidth="1" strokeLinecap="round" />
          <line x1="0" y1="-4" x2="0" y2="-2" stroke="rgb(34 211 238)" strokeWidth="1" strokeLinecap="round" />
          <line x1="0" y1="2"  x2="0" y2="4"  stroke="rgb(34 211 238)" strokeWidth="1" strokeLinecap="round" />

          {/* Center dot */}
          <circle cx="0" cy="0" r="1.5" fill="rgb(34 211 238)" />
        </svg>
      )}
    </div>
  );
}
