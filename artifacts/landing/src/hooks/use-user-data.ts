import { useState, useEffect, useCallback, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  ⚙️  UNIT SETTINGS — how measurements are displayed.
//
//  These are the defaults the page boots with; visitors can change any of them
//  live via the in-page Units panel (the gear button in the top bar). Every
//  field accepts "auto", which infers the unit from the visitor's browser locale
//  (US → imperial, everywhere else → metric). Set an explicit unit to force it
//  regardless of locale.
// ─────────────────────────────────────────────────────────────────────────────
export type UnitSettings = {
  /** Master preference used to resolve any field left on "auto". */
  units: "auto" | "imperial" | "metric";
  /** Temperature scale. "auto" → °F in the US, °C elsewhere. */
  temperature: "auto" | "F" | "C";
  /** Wind speed. "auto" → mph (imperial) / km/h (metric). */
  windSpeed: "auto" | "mph" | "kmh" | "ms" | "kn";
  /** Barometric pressure. */
  pressure: "auto" | "inHg" | "hPa" | "mmHg";
  /** Elevation / altitude. "auto" → feet (imperial) / metres (metric). */
  distance: "auto" | "ft" | "m";
};

export const DEFAULT_UNITS: UnitSettings = {
  units: "auto",
  temperature: "auto",
  windSpeed: "auto",
  pressure: "inHg", // pressure defaults to inches of mercury
  distance: "auto",
};

// ── Resolve settings into concrete units, honouring "auto" + browser locale ──
export type ResolvedUnits = {
  imperial: boolean;
  temp: "F" | "C";
  wind: "mph" | "kmh" | "ms" | "kn";
  pressure: "inHg" | "hPa" | "mmHg";
  distance: "ft" | "m";
};

export function resolveUnits(s: UnitSettings): ResolvedUnits {
  // Master preference: explicit choice wins, otherwise sniff the locale.
  const imperial =
    s.units === "imperial"
      ? true
      : s.units === "metric"
        ? false
        : (navigator.language || "").toLowerCase().includes("us");

  return {
    imperial,
    temp: s.temperature === "auto" ? (imperial ? "F" : "C") : s.temperature,
    wind: s.windSpeed === "auto" ? (imperial ? "mph" : "kmh") : s.windSpeed,
    pressure: s.pressure === "auto" ? (imperial ? "inHg" : "hPa") : s.pressure,
    distance: s.distance === "auto" ? (imperial ? "ft" : "m") : s.distance,
  };
}

// Open-Meteo wind_speed_unit values, keyed by our resolved wind unit.
const WIND_API_UNIT: Record<ResolvedUnits["wind"], string> = {
  mph: "mph", kmh: "kmh", ms: "ms", kn: "kn",
};
const WIND_LABEL: Record<ResolvedUnits["wind"], string> = {
  mph: "mph", kmh: "km/h", ms: "m/s", kn: "kn",
};

// Open-Meteo reports surface_pressure in hPa; convert to the chosen unit.
function formatPressure(hPa: number, unit: ResolvedUnits["pressure"]): string {
  switch (unit) {
    case "inHg": return `${(hPa * 0.02953).toFixed(2)} inHg`;
    case "mmHg": return `${Math.round(hPa * 0.750062)} mmHg`;
    default:     return `${Math.round(hPa)} hPa`;
  }
}

export interface UserData {
  // ---- status ----
  loading: boolean;
  error: boolean;
  permissionState: string; // geolocation permission: granted | denied | prompt | unsupported

  // ---- location (drives the globe) ----
  coordinates: [number, number] | null;
  precise: boolean;
  accuracy: string | null;
  locationLabel: string | null; // short name for the globe pill
  locationText: string | null; // "City, Region, Country"
  altitude: string | null;

  // ---- network / IP ----
  ip: string | null;
  isp: string | null;
  org: string | null;
  asn: string | null;
  postal: string | null;
  countryFlag: string | null;
  currency: string | null;
  vpnProxy: string | null;
  ipSource: string | null; // which provider answered

  // ---- coordinate-derived ----
  elevation: string | null;
  weather: string | null;
  feelsLike: string | null;
  humidity: string | null;
  wind: string | null;
  pressure: string | null;
  cloudCover: string | null;
  uvIndex: string | null;
  sunrise: string | null;
  sunset: string | null;
  airQuality: string | null;

  // ---- time ----
  timezone: string;
  utcOffset: string;
  localTime: string;
  locale: string;

  // ---- device / browser ----
  browser: string;
  os: string;
  deviceModel: string | null;
  cpuArch: string | null;
  cpuCores: string;
  deviceMemory: string | null;
  gpu: string | null;
  gpuVendor: string | null;
  battery: string | null;
  storage: string | null;

  // ---- display ----
  screenResolution: string;
  availResolution: string;
  windowSize: string;
  pixelRatio: string;
  colorDepth: string;
  colorGamut: string | null;
  orientation: string | null;
  hdr: string | null;

  // ---- input / media ----
  touchSupport: string;
  pointerType: string | null;
  cameras: string | null;
  microphones: string | null;
  speakers: string | null;

  // ---- preferences / privacy ----
  language: string;
  languages: string | null;
  cookiesEnabled: string;
  doNotTrack: string;
  gpc: string | null;
  reducedMotion: string | null;
  colorScheme: string | null;
  connectionType: string | null;
  connectionDetail: string | null;
  onlineStatus: string;
  referrer: string | null;
  webdriver: string | null;

  // ---- fingerprint ----
  canvasHash: string | null;
  fonts: string | null;
  permissions: string | null;
}

const WMO: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime fog", 51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle",
  56: "Freezing drizzle", 57: "Freezing drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain",
  66: "Freezing rain", 67: "Freezing rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow",
  77: "Snow grains", 80: "Light showers", 81: "Showers", 82: "Violent showers",
  85: "Snow showers", 86: "Snow showers", 95: "Thunderstorm", 96: "Thunderstorm + hail",
  99: "Severe thunderstorm",
};

const WMO_ICON: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 45: "🌫️", 48: "🌫️", 51: "🌦️", 53: "🌦️", 55: "🌧️",
  56: "🌧️", 57: "🌧️", 61: "🌧️", 63: "🌧️", 65: "🌧️", 66: "🌧️", 67: "🌧️", 71: "🌨️", 73: "🌨️",
  75: "❄️", 77: "🌨️", 80: "🌦️", 81: "🌧️", 82: "⛈️", 85: "🌨️", 86: "❄️", 95: "⛈️", 96: "⛈️", 99: "⛈️",
};

function compass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function initialData(): UserData {
  const res = Intl.DateTimeFormat().resolvedOptions();
  const offMin = -new Date().getTimezoneOffset();
  const sign = offMin >= 0 ? "+" : "-";
  const abs = Math.abs(offMin);
  const utcOffset = `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
  const nav = navigator as any;

  const mq = (q: string) => {
    try { return window.matchMedia(q).matches; } catch { return false; }
  };

  let colorGamut: string | null = "sRGB";
  if (mq("(color-gamut: rec2020)")) colorGamut = "Rec. 2020";
  else if (mq("(color-gamut: p3)")) colorGamut = "Display P3";

  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

  return {
    loading: true,
    error: false,
    permissionState: "prompt",

    coordinates: null,
    precise: false,
    accuracy: null,
    locationLabel: null,
    locationText: null,
    altitude: null,

    ip: null, isp: null, org: null, asn: null, postal: null,
    countryFlag: null, currency: null, vpnProxy: null, ipSource: null,

    elevation: null, weather: null, feelsLike: null, humidity: null, wind: null,
    pressure: null, cloudCover: null, uvIndex: null, sunrise: null, sunset: null, airQuality: null,

    timezone: res.timeZone || "Unknown",
    utcOffset,
    localTime: new Date().toLocaleTimeString(),
    locale: res.locale || navigator.language || "Unknown",

    browser: "Detecting…",
    os: "Detecting…",
    deviceModel: null,
    cpuArch: null,
    cpuCores: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : "Unknown",
    deviceMemory: nav.deviceMemory ? `${nav.deviceMemory} GB` : null,
    gpu: null,
    gpuVendor: null,
    battery: null,
    storage: null,

    screenResolution: `${window.screen.width} × ${window.screen.height}`,
    availResolution: `${window.screen.availWidth} × ${window.screen.availHeight}`,
    windowSize: `${window.innerWidth} × ${window.innerHeight}`,
    pixelRatio: `${window.devicePixelRatio}×`,
    colorDepth: `${window.screen.colorDepth}-bit`,
    colorGamut,
    orientation: (window.screen.orientation && window.screen.orientation.type) || null,
    hdr: mq("(dynamic-range: high)") ? "HDR capable" : "Standard (SDR)",

    touchSupport: navigator.maxTouchPoints > 0 ? `Yes · ${navigator.maxTouchPoints} points` : "No",
    pointerType: mq("(pointer: coarse)") ? "Touch / coarse" : mq("(pointer: fine)") ? "Mouse / fine" : null,
    cameras: null, microphones: null, speakers: null,

    language: navigator.language || "Unknown",
    languages: navigator.languages ? navigator.languages.join(", ") : null,
    cookiesEnabled: navigator.cookieEnabled ? "Enabled" : "Disabled",
    doNotTrack: navigator.doNotTrack === "1" ? "Enabled" : "Not set",
    gpc: typeof nav.globalPrivacyControl === "boolean" ? (nav.globalPrivacyControl ? "Enabled" : "Off") : null,
    reducedMotion: mq("(prefers-reduced-motion: reduce)") ? "Reduced" : "No preference",
    colorScheme: mq("(prefers-color-scheme: dark)") ? "Dark" : "Light",
    connectionType: conn?.effectiveType ? conn.effectiveType.toUpperCase() : null,
    connectionDetail: conn?.downlink != null ? `${conn.downlink} Mbps · ${conn.rtt ?? "?"} ms RTT${conn.saveData ? " · Data Saver" : ""}` : null,
    onlineStatus: navigator.onLine ? "Online" : "Offline",
    referrer: document.referrer || "Direct / none",
    webdriver: navigator.webdriver ? "Automated (webdriver)" : "Human (no webdriver)",

    canvasHash: null,
    fonts: null,
    permissions: null,
  };
}

function detectBrowserOS(): { browser: string; os: string } {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("OPR/") || ua.includes("Opera")) browser = "Opera";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/")) browser = "Safari";

  let os = "Unknown OS";
  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if (ua.includes("Windows")) os = "Windows";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("Linux")) os = "Linux";
  return { browser, os };
}

function canvasFingerprint(): string | null {
  try {
    const c = document.createElement("canvas");
    c.width = 240; c.height = 60;
    const x = c.getContext("2d");
    if (!x) return null;
    x.textBaseline = "top";
    x.font = "16px 'Arial'";
    x.fillStyle = "#f60";
    x.fillRect(0, 0, 120, 30);
    x.fillStyle = "#069";
    x.fillText("Globe fingerprint 🌐", 2, 4);
    x.strokeStyle = "rgba(120,0,200,0.6)";
    x.arc(60, 30, 20, 0, Math.PI * 2);
    x.stroke();
    const data = c.toDataURL();
    let h = 0x811c9dc5;
    for (let i = 0; i < data.length; i++) {
      h ^= data.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
  } catch {
    return null;
  }
}

function detectFonts(): string | null {
  try {
    const base = ["monospace", "sans-serif", "serif"];
    const test = ["Arial", "Helvetica", "Times New Roman", "Courier New", "Georgia",
      "Verdana", "Segoe UI", "Roboto", "Ubuntu", "Menlo", "Consolas", "Cantarell",
      "Comic Sans MS", "Impact", "Tahoma", "Trebuchet MS", "Palatino"];
    const span = document.createElement("span");
    span.style.cssText = "position:absolute;left:-9999px;font-size:72px";
    span.textContent = "mmmmmmmmmmlli";
    document.body.appendChild(span);
    const baseline: Record<string, number> = {};
    for (const b of base) {
      span.style.fontFamily = b;
      baseline[b] = span.offsetWidth;
    }
    let count = 0;
    for (const f of test) {
      let detected = false;
      for (const b of base) {
        span.style.fontFamily = `'${f}',${b}`;
        if (span.offsetWidth !== baseline[b]) { detected = true; break; }
      }
      if (detected) count++;
    }
    document.body.removeChild(span);
    return `${count} of ${test.length} probed`;
  } catch {
    return null;
  }
}

function readGPU(): { gpu: string | null; vendor: string | null } {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl") || c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return { gpu: null, vendor: null };
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    if (!dbg) return { gpu: null, vendor: null };
    const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string;
    const vendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) as string;
    return { gpu: renderer || null, vendor: vendor || null };
  } catch {
    return { gpu: null, vendor: null };
  }
}

// timeout-guarded fetch → JSON
async function getJSON(url: string, ms = 5000): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

export function useUserData() {
  const [data, setData] = useState<UserData>(initialData);
  const patch = useCallback((p: Partial<UserData>) => setData((prev) => ({ ...prev, ...p })), []);
  const lastGeoKey = useRef<string>("");

  // Live unit preferences. `settingsRef` mirrors state so the async fetchers
  // always read the latest units without being re-created on every change.
  const [unitSettings, setUnitSettings] = useState<UnitSettings>(DEFAULT_UNITS);
  const settingsRef = useRef<UnitSettings>(unitSettings);
  const coordsRef = useRef<[number, number] | null>(null);

  // Fetch weather / elevation / air-quality / sun times for a coordinate.
  const loadGeoDerived = useCallback(async (lat: number, lon: number) => {
    coordsRef.current = [lat, lon];
    // Key by coordinate AND unit settings so changing units triggers a refetch.
    const key = `${lat.toFixed(2)},${lon.toFixed(2)}|${JSON.stringify(settingsRef.current)}`;
    if (lastGeoKey.current === key) return;
    lastGeoKey.current = key;

    const units = resolveUnits(settingsRef.current);
    const tUnit = units.temp === "F" ? "fahrenheit" : "celsius";
    const wUnit = WIND_API_UNIT[units.wind];
    const tSym = units.temp === "F" ? "°F" : "°C";
    const wSym = WIND_LABEL[units.wind];

    getJSON(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m` +
      `&daily=sunrise,sunset,uv_index_max&timezone=auto&temperature_unit=${tUnit}&wind_speed_unit=${wUnit}`
    ).then((w) => {
      const c = w.current || {};
      const d = w.daily || {};
      const code = c.weather_code;
      const icon = WMO_ICON[code] || "";
      const desc = WMO[code] || "Unknown";
      const fmtTime = (iso?: string) => {
        if (!iso) return null;
        try { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
        catch { return iso; }
      };
      patch({
        weather: c.temperature_2m != null ? `${icon} ${Math.round(c.temperature_2m)}${tSym} · ${desc}` : null,
        feelsLike: c.apparent_temperature != null ? `${Math.round(c.apparent_temperature)}${tSym}` : null,
        humidity: c.relative_humidity_2m != null ? `${c.relative_humidity_2m}%` : null,
        wind: c.wind_speed_10m != null ? `${Math.round(c.wind_speed_10m)} ${wSym} ${compass(c.wind_direction_10m || 0)}` : null,
        pressure: c.surface_pressure != null ? formatPressure(c.surface_pressure, units.pressure) : null,
        cloudCover: c.cloud_cover != null ? `${c.cloud_cover}%` : null,
        uvIndex: d.uv_index_max?.[0] != null ? `${d.uv_index_max[0]}` : null,
        sunrise: fmtTime(d.sunrise?.[0]),
        sunset: fmtTime(d.sunset?.[0]),
      });
    }).catch(() => {});

    getJSON(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`)
      .then((e) => {
        const m = e.elevation?.[0];
        if (m != null) {
          patch({ elevation: units.distance === "ft" ? `${Math.round(m * 3.281)} ft` : `${Math.round(m)} m` });
        }
      }).catch(() => {});

    getJSON(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5`)
      .then((a) => {
        const aqi = a.current?.us_aqi;
        const pm = a.current?.pm2_5;
        if (aqi != null) {
          const band = aqi <= 50 ? "Good" : aqi <= 100 ? "Moderate" : aqi <= 150 ? "Unhealthy (sensitive)" : aqi <= 200 ? "Unhealthy" : "Very unhealthy";
          patch({ airQuality: `AQI ${aqi} · ${band}${pm != null ? ` · PM2.5 ${pm}` : ""}` });
        }
      }).catch(() => {});
  }, [patch]);

  // Reverse-geocode precise coordinates → place name.
  const reverseGeocode = useCallback(async (lat: number, lon: number) => {
    try {
      const b = await getJSON(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const city = b.city || b.locality || b.principalSubdivision || "";
      const parts = [b.city || b.locality, b.principalSubdivision, b.countryName].filter(Boolean);
      patch({
        locationLabel: city || b.countryName || "Your location",
        locationText: parts.join(", ") || null,
        postal: b.postcode || undefined,
      });
    } catch { /* keep IP-derived label */ }
  }, [patch]);

  // Attempt a precise GPS fix (used on mount and via the button).
  const requestPrecise = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        patch({
          coordinates: [lat, lon],
          precise: true,
          permissionState: "granted",
          accuracy: pos.coords.accuracy != null ? `±${Math.round(pos.coords.accuracy)} m` : null,
          altitude: pos.coords.altitude != null
            ? (resolveUnits(settingsRef.current).distance === "ft"
                ? `${Math.round(pos.coords.altitude * 3.281)} ft`
                : `${Math.round(pos.coords.altitude)} m`)
            : null,
          loading: false,
          error: false,
        });
        reverseGeocode(lat, lon);
        loadGeoDerived(lat, lon);
      },
      (err) => {
        patch({ permissionState: err.code === 1 ? "denied" : "prompt" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [patch, reverseGeocode, loadGeoDerived]);

  useEffect(() => {
    // live clock
    const timer = setInterval(() => {
      patch({ localTime: new Date().toLocaleTimeString() });
    }, 1000);

    // browser / OS
    patch(detectBrowserOS());

    // high-entropy UA (Chromium)
    const uaData = (navigator as any).userAgentData;
    if (uaData?.getHighEntropyValues) {
      uaData.getHighEntropyValues(["architecture", "bitness", "model", "platformVersion", "uaFullVersion", "fullVersionList"])
        .then((he: any) => {
          const brand = he.fullVersionList?.find((b: any) => !/Not.?A.?Brand/i.test(b.brand));
          patch({
            cpuArch: he.architecture ? `${he.architecture}${he.bitness ? ` · ${he.bitness}-bit` : ""}` : null,
            deviceModel: he.model || null,
            browser: brand ? `${brand.brand} ${brand.version.split(".")[0]}` : undefined,
          });
        }).catch(() => {});
    }

    // GPU
    const { gpu, vendor } = readGPU();
    patch({ gpu, gpuVendor: vendor });

    // canvas + fonts fingerprint
    patch({ canvasHash: canvasFingerprint(), fonts: detectFonts() });

    // battery
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((bat: any) => {
        const upd = () => patch({
          battery: `${Math.round(bat.level * 100)}% · ${bat.charging ? "Charging" : "On battery"}`,
        });
        upd();
        bat.addEventListener("levelchange", upd);
        bat.addEventListener("chargingchange", upd);
      }).catch(() => {});
    }

    // storage estimate
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then((est) => {
        const gb = (n?: number) => (n ? (n / 1073741824).toFixed(1) : "0");
        if (est.quota) {
          patch({ storage: `${gb(est.usage)} GB used of ~${gb(est.quota)} GB quota` });
        }
      }).catch(() => {});
    }

    // media device counts
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((list) => {
        const n = (k: string) => list.filter((d) => d.kind === k).length;
        patch({
          cameras: `${n("videoinput")}`,
          microphones: `${n("audioinput")}`,
          speakers: `${n("audiooutput")}`,
        });
      }).catch(() => {});
    }

    // permission states (no prompt)
    if (navigator.permissions?.query) {
      const names = ["geolocation", "camera", "microphone", "notifications"];
      Promise.all(names.map(async (name) => {
        try { return `${name}: ${(await navigator.permissions.query({ name: name as PermissionName })).state}`; }
        catch { return null; }
      })).then((rows) => {
        const clean = rows.filter(Boolean) as string[];
        if (clean.length) patch({ permissions: clean.join(" · ") });
      });
      navigator.permissions.query({ name: "geolocation" as PermissionName })
        .then((s) => patch({ permissionState: s.state }))
        .catch(() => {});
    }

    // --- location: IP fallback first, then attempt precise upgrade ---
    const ipChain = async () => {
      // 1) ipwho.is (richest)
      try {
        const j = await getJSON("https://ipwho.is/");
        if (j && j.success !== false && j.latitude != null) {
          patch({
            loading: false,
            ipSource: "ipwho.is",
            ip: j.ip || null,
            coordinates: [j.latitude, j.longitude],
            locationLabel: j.city || j.country || null,
            locationText: [j.city, j.region, j.country].filter(Boolean).join(", ") || null,
            isp: j.connection?.isp || j.connection?.org || null,
            org: j.connection?.org || null,
            asn: j.connection?.asn ? `AS${String(j.connection.asn).replace(/^AS/i, "")}` : null,
            postal: j.postal || null,
            countryFlag: j.flag?.emoji || null,
            currency: j.currency?.code ? `${j.currency.code}${j.currency.symbol ? ` (${j.currency.symbol})` : ""}` : null,
            vpnProxy: j.security ? (j.security.vpn || j.security.proxy || j.security.tor ? "VPN / proxy detected" : "None detected") : null,
          });
          loadGeoDerived(j.latitude, j.longitude);
          return true;
        }
      } catch { /* fall through */ }
      // 2) geojs.io (no rate limit)
      try {
        const g = await getJSON("https://get.geojs.io/v1/ip/geo.json");
        if (g && g.latitude != null) {
          patch({
            loading: false,
            ipSource: "geojs.io",
            ip: g.ip || null,
            coordinates: [parseFloat(g.latitude), parseFloat(g.longitude)],
            locationLabel: g.city || g.country || null,
            locationText: [g.city, g.region, g.country].filter(Boolean).join(", ") || null,
            org: g.organization_name || null,
            isp: g.organization_name || null,
            asn: g.asn ? `AS${g.asn}` : null,
          });
          loadGeoDerived(parseFloat(g.latitude), parseFloat(g.longitude));
          return true;
        }
      } catch { /* fall through */ }
      // 3) ipapi.co
      try {
        const p = await getJSON("https://ipapi.co/json/");
        if (p && !p.error && p.latitude != null) {
          patch({
            loading: false,
            ipSource: "ipapi.co",
            ip: p.ip || null,
            coordinates: [p.latitude, p.longitude],
            locationLabel: p.city || p.country_name || null,
            locationText: [p.city, p.region, p.country_name].filter(Boolean).join(", ") || null,
            org: p.org || null,
            isp: p.org || null,
            asn: p.asn || null,
            postal: p.postal || null,
            currency: p.currency || null,
          });
          loadGeoDerived(p.latitude, p.longitude);
          return true;
        }
      } catch { /* fall through */ }
      return false;
    };

    ipChain().then((ok) => {
      if (!ok) patch({ loading: false, error: true, locationText: "Location unavailable" });
      // Upgrade to precise unless the user already denied it.
      let state = "prompt";
      const done = () => { if (state !== "denied") requestPrecise(); };
      if (navigator.permissions?.query) {
        navigator.permissions.query({ name: "geolocation" as PermissionName })
          .then((s) => { state = s.state; done(); })
          .catch(done);
      } else {
        done();
      }
    });

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update unit preferences and immediately re-derive weather for the current
  // coordinate so the change is reflected without a page reload.
  const setUnit = useCallback((changes: Partial<UnitSettings>) => {
    const next = { ...settingsRef.current, ...changes };
    settingsRef.current = next;
    setUnitSettings(next);
    const coords = coordsRef.current;
    if (coords) loadGeoDerived(coords[0], coords[1]);
  }, [loadGeoDerived]);

  return { ...data, requestPrecise, unitSettings, setUnit };
}
