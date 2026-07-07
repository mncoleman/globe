<div align="center">

# ⦿ &nbsp;Globe

### *You are here. And your browser just told me so.*

An interactive 3D globe that quietly reads **~60 things** off your device the instant you land — location, hardware, network, fingerprint — and renders your digital shadow in real time.

**No backend. No database. No tracking. No cookies.** Everything runs in *your* browser and evaporates the moment you close the tab.

<br>

[![live](https://img.shields.io/badge/live-globe.mncoleman.com-22d3ee?style=for-the-badge&labelColor=0a0a0f)](https://globe.mncoleman.com)
&nbsp;
![backend](https://img.shields.io/badge/backend-none-0a0a0f?style=for-the-badge)
&nbsp;
![keys](https://img.shields.io/badge/API_keys-zero-0a0a0f?style=for-the-badge)

![React](https://img.shields.io/badge/React_19-0a0a0f?logo=react&logoColor=22d3ee)
![Vite](https://img.shields.io/badge/Vite_7-0a0a0f?logo=vite&logoColor=22d3ee)
![TypeScript](https://img.shields.io/badge/TypeScript-0a0a0f?logo=typescript&logoColor=22d3ee)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-0a0a0f?logo=tailwindcss&logoColor=22d3ee)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-0a0a0f?logo=githubpages&logoColor=22d3ee)
![License](https://img.shields.io/badge/license-MIT-0a0a0f)

</div>

---

> The moment this page loaded, your browser volunteered your city, your GPU, your screen, your timezone, your ISP, and a hash that's almost certainly unique to your exact machine — no permission dialog required. Grant location once and it sharpens from *"somewhere near your ISP"* to *±35 meters*.
>
> **Globe doesn't store any of it.** It just holds up a mirror.

```
◌ SIGNAL ACQUIRED ─────────────────────────────────────────────
  ├ location ......... Windsor, Colorado · ±35 m ............ [GPS]
  ├ weather .......... ☀️  95°F · clear · 16% humidity
  ├ device ........... Apple M4 Pro · 12 cores · 16 GB
  ├ network .......... AS7922 · Comcast · 4G · 1.45 Mbps
  ├ display .......... 1800×1169 · P3 · HDR · 2× DPR
  └ fingerprint ...... canvas#a3f9e1c0 · 14 fonts · webdriver:no
────────────────────────────────────────────────────────────────
```

<br>

## 🌍 What it knows about you

Every signal below is read **client-side only**. Cards silently disappear when a browser doesn't expose a given field, so you always see the truth for *your* browser — never a wall of "unsupported."

<details open>
<summary><b>📍 Location &amp; surroundings</b></summary>

Precise GPS (with a graceful IP fallback) → coordinates, accuracy, elevation, and the world around you: live **weather**, feels-like, humidity, wind, pressure, cloud cover, **air quality**, UV index, sunrise &amp; sunset.
</details>

<details>
<summary><b>📡 Network &amp; identity</b></summary>

Public IP, ISP, organization, **ASN**, postal code, currency, VPN/proxy detection, connection type, link speed &amp; RTT, and where you were referred from.
</details>

<details>
<summary><b>🖥 Device &amp; hardware</b></summary>

Browser &amp; version, OS, device model, CPU architecture, logical cores, device memory, **GPU** (unmasked via WebGL — yes, it names your exact chip), battery state, and storage quota.
</details>

<details>
<summary><b>🎨 Display &amp; input</b></summary>

Screen &amp; available resolution, window size, pixel ratio, color depth, **color gamut**, dynamic range (HDR), orientation, pointer type, touch points, and camera / mic / speaker counts.
</details>

<details>
<summary><b>🕵️ Preferences, privacy &amp; fingerprint</b></summary>

Languages, timezone, locale, color-scheme &amp; reduced-motion preferences, cookies, Do&nbsp;Not&nbsp;Track, Global Privacy Control, automation (webdriver) detection, live **canvas fingerprint hash**, installed-font probe, and permission states.
</details>

<br>

## 🧭 The pin — a small obsession

The location marker isn't a flat dot. It's a **glossy 3D map-pin with a floating label** that rides the surface of the globe, fading away as it rotates over the horizon and swinging back into view as it comes around.

That's harder than it sounds. [cobe](https://github.com/shuding/cobe) draws its globe entirely inside a WebGL fragment shader — there's no DOM element to anchor an HTML pin to. So Globe **reverse-engineers cobe's own internal projection** (`U()` lat/lon→sphere and `O()` sphere→screen) and mirrors it in JavaScript, projecting the marker's screen coordinates every animation frame:

```ts
// cobe U(): [lat, lon] → unit sphere      cobe O(): sphere → screen (with spin φ, tilt θ)
const x = -cos(latR) * cos(lonA);          const c  =  cosφ*x + sinφ*z;
const y =  sin(latR);                      const s  =  sinφ*sinθ*x + cosθ*y - cosφ*sinθ*z;
const z =  cos(latR) * sin(lonA);          const dz = -sinφ*cosθ*x + sinθ*y + cosφ*cosθ*z; // ≥0 = facing you
```

The HTML pin is then translated to `((c+1)/2 · size, (1−s)/2 · size)` each frame and its opacity driven by `dz`, so it stays glued to the right patch of Earth as the globe spins — pixel-locked to a shader it can't see into.

<br>

## ⚙️ How it works

- **100% static, 100% client-side.** A single-page React app served from GitHub Pages. There is no server to send your data to, because there is no server.
- **Zero API keys, zero cost.** Enrichment (IP geo, reverse-geocode, weather) uses only free, no-key, CORS-friendly public APIs, each wrapped in a timeout with an independent fallback so one slow endpoint never blanks the page.
- **Resilient by design.** Location resolves through a fallback chain: **`ipwho.is` → `geojs.io` → `ipapi.co`**, then upgrades to precise GPS if you allow it.
- **Graceful degradation.** Every browser API is feature-detected; unsupported signals are hidden, not faked.

<br>

## 🔒 Privacy

Globe is a **demonstration of how much a webpage can see**, built to be the opposite of what it demonstrates:

- Nothing is sent to a server owned by this project — there isn't one.
- Nothing is stored: no cookies, no `localStorage`, no analytics.
- Third-party calls go **only** to the public geo/weather APIs listed below, purely to enrich what your browser already handed over.
- Close the tab and every byte is gone.

<br>

## 🛠 Stack

| | |
|---|---|
| **Framework** | React 19 · Vite 7 · TypeScript |
| **Styling** | Tailwind CSS v4 · shadcn/ui · lucide-react |
| **Globe** | [cobe](https://github.com/shuding/cobe) (WebGL) |
| **Motion** | framer-motion |
| **Hosting** | GitHub Actions → `gh-pages` → GitHub Pages (custom domain) |

<br>

## 🚀 Run it locally

This is a `pnpm` workspace; the site lives in `artifacts/landing`.

```bash
pnpm install

# dev server
BASE_PATH=/ PORT=5173 pnpm --filter @workspace/landing dev

# production build (as GitHub Pages ships it)
pnpm --filter @workspace/landing exec vite build --config vite.gh-pages.config.ts
```

> Note: the workspace pins native deps to `linux-x64` for CI. If you build on macOS/Windows, run inside the app folder and let pnpm resolve your platform, or just push — GitHub Actions builds and deploys on every commit to `main`.

<br>

## 📡 Data sources

All free · no key · HTTPS · CORS:

- **IP geolocation** — [ipwho.is](https://ipwho.is) → [geojs.io](https://www.geojs.io) → [ipapi.co](https://ipapi.co)
- **Reverse geocoding** — [BigDataCloud](https://www.bigdatacloud.com)
- **Weather, elevation &amp; air quality** — [Open-Meteo](https://open-meteo.com)

<br>

---

<div align="center">

**[globe.mncoleman.com](https://globe.mncoleman.com)** &nbsp;·&nbsp; MIT &nbsp;·&nbsp; built by [@mncoleman](https://github.com/mncoleman)

<sub>Grant location if you dare. It's more accurate than you'd like.</sub>

</div>
