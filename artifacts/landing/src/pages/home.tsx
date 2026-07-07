import { InteractiveGlobe } from "@/components/globe";
import { useUserData, type UserData } from "@/hooks/use-user-data";
import { GlassCard } from "@/components/ui/glass-card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import {
  MapPin, Navigation, Crosshair, Clock, Calendar, Globe as GlobeIcon,
  Monitor, Cpu, HardDrive, Battery, Wifi, Fingerprint, ShieldAlert,
  Activity, Maximize, Palette, Layers, MonitorSmartphone, Languages,
  Cookie, Camera, Mic, Volume2, Server, Network, Thermometer, Wind,
  Droplets, Sunrise, Sunset, Mountain, Hash, DollarSign, Compass,
  Gauge, CloudSun, ScanLine, Bot, Eye, Building2, Contrast, Moon,
  Pointer, Radio, LocateFixed, Smartphone,
} from "lucide-react";
import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface Field {
  icon: ReactNode;
  label: string;
  value: string | null | undefined;
  span?: number;
}

export default function Home() {
  const userData = useUserData();

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  const d: UserData = userData;

  const sections: { title: string; blurb: string; fields: Field[] }[] = [
    {
      title: "Location & Surroundings",
      blurb: "Where you are — and the world immediately around you.",
      fields: [
        { icon: <Navigation className="w-5 h-5" />, label: "Coordinates", value: d.coordinates ? `${d.coordinates[0].toFixed(4)}, ${d.coordinates[1].toFixed(4)}` : null },
        { icon: <Crosshair className="w-5 h-5" />, label: "Accuracy", value: d.precise ? (d.accuracy || "GPS fix") : "City-level (IP)" },
        { icon: <Mountain className="w-5 h-5" />, label: "Elevation", value: d.elevation },
        { icon: <CloudSun className="w-5 h-5" />, label: "Weather", value: d.weather, span: 2 },
        { icon: <Thermometer className="w-5 h-5" />, label: "Feels Like", value: d.feelsLike },
        { icon: <Droplets className="w-5 h-5" />, label: "Humidity", value: d.humidity },
        { icon: <Wind className="w-5 h-5" />, label: "Wind", value: d.wind },
        { icon: <Gauge className="w-5 h-5" />, label: "Pressure", value: d.pressure },
        { icon: <CloudSun className="w-5 h-5" />, label: "Cloud Cover", value: d.cloudCover },
        { icon: <Activity className="w-5 h-5" />, label: "Air Quality", value: d.airQuality, span: 2 },
        { icon: <Sunrise className="w-5 h-5" />, label: "Sunrise", value: d.sunrise },
        { icon: <Sunset className="w-5 h-5" />, label: "Sunset", value: d.sunset },
        { icon: <Activity className="w-5 h-5" />, label: "UV Index (max)", value: d.uvIndex },
      ],
    },
    {
      title: "Network & Identity",
      blurb: "What your connection tells the internet about you.",
      fields: [
        { icon: <Network className="w-5 h-5" />, label: "IP Address", value: d.ip },
        { icon: <Server className="w-5 h-5" />, label: "ISP", value: d.isp, span: 2 },
        { icon: <Building2 className="w-5 h-5" />, label: "Organization", value: d.org, span: 2 },
        { icon: <Hash className="w-5 h-5" />, label: "ASN", value: d.asn },
        { icon: <MapPin className="w-5 h-5" />, label: "Postal Code", value: d.postal },
        { icon: <DollarSign className="w-5 h-5" />, label: "Currency", value: d.currency },
        { icon: <ShieldAlert className="w-5 h-5" />, label: "VPN / Proxy", value: d.vpnProxy },
        { icon: <Wifi className="w-5 h-5" />, label: "Connection", value: d.connectionType },
        { icon: <Gauge className="w-5 h-5" />, label: "Link Speed", value: d.connectionDetail, span: 2 },
        { icon: <Radio className="w-5 h-5" />, label: "Status", value: d.onlineStatus },
        { icon: <Eye className="w-5 h-5" />, label: "Referred From", value: d.referrer, span: 2 },
        { icon: <ScanLine className="w-5 h-5" />, label: "Data Source", value: d.ipSource ? `IP via ${d.ipSource}` : null },
      ],
    },
    {
      title: "Time & Locale",
      blurb: "Your clock and cultural settings.",
      fields: [
        { icon: <Clock className="w-5 h-5" />, label: "Local Time", value: d.localTime },
        { icon: <GlobeIcon className="w-5 h-5" />, label: "Timezone", value: d.timezone },
        { icon: <Compass className="w-5 h-5" />, label: "UTC Offset", value: d.utcOffset },
        { icon: <Calendar className="w-5 h-5" />, label: "Locale", value: d.locale },
      ],
    },
    {
      title: "Device & Hardware",
      blurb: "The machine you're reading this on.",
      fields: [
        { icon: <Monitor className="w-5 h-5" />, label: "Browser", value: d.browser, span: 1 },
        { icon: <MonitorSmartphone className="w-5 h-5" />, label: "Operating System", value: d.os },
        { icon: <Smartphone className="w-5 h-5" />, label: "Device Model", value: d.deviceModel },
        { icon: <Cpu className="w-5 h-5" />, label: "CPU Architecture", value: d.cpuArch },
        { icon: <Cpu className="w-5 h-5" />, label: "Logical Cores", value: d.cpuCores },
        { icon: <Layers className="w-5 h-5" />, label: "Device Memory", value: d.deviceMemory },
        { icon: <ScanLine className="w-5 h-5" />, label: "GPU", value: d.gpu, span: 2 },
        { icon: <ScanLine className="w-5 h-5" />, label: "GPU Vendor", value: d.gpuVendor },
        { icon: <Battery className="w-5 h-5" />, label: "Battery", value: d.battery },
        { icon: <HardDrive className="w-5 h-5" />, label: "Storage Estimate", value: d.storage, span: 2 },
      ],
    },
    {
      title: "Display & Input",
      blurb: "Your screen and how you touch it.",
      fields: [
        { icon: <Maximize className="w-5 h-5" />, label: "Screen Resolution", value: d.screenResolution },
        { icon: <Maximize className="w-5 h-5" />, label: "Available Screen", value: d.availResolution },
        { icon: <Monitor className="w-5 h-5" />, label: "Window Size", value: d.windowSize },
        { icon: <ScanLine className="w-5 h-5" />, label: "Pixel Ratio", value: d.pixelRatio },
        { icon: <Palette className="w-5 h-5" />, label: "Color Depth", value: d.colorDepth },
        { icon: <Palette className="w-5 h-5" />, label: "Color Gamut", value: d.colorGamut },
        { icon: <Contrast className="w-5 h-5" />, label: "Dynamic Range", value: d.hdr },
        { icon: <MonitorSmartphone className="w-5 h-5" />, label: "Orientation", value: d.orientation },
        { icon: <Pointer className="w-5 h-5" />, label: "Pointer", value: d.pointerType },
        { icon: <MonitorSmartphone className="w-5 h-5" />, label: "Touch Support", value: d.touchSupport },
        { icon: <Camera className="w-5 h-5" />, label: "Cameras", value: d.cameras },
        { icon: <Mic className="w-5 h-5" />, label: "Microphones", value: d.microphones },
        { icon: <Volume2 className="w-5 h-5" />, label: "Speakers", value: d.speakers },
      ],
    },
    {
      title: "Preferences & Privacy",
      blurb: "Signals and preferences your browser broadcasts.",
      fields: [
        { icon: <Languages className="w-5 h-5" />, label: "Language", value: d.language },
        { icon: <Languages className="w-5 h-5" />, label: "All Languages", value: d.languages, span: 2 },
        { icon: <Moon className="w-5 h-5" />, label: "Color Scheme", value: d.colorScheme },
        { icon: <Activity className="w-5 h-5" />, label: "Reduced Motion", value: d.reducedMotion },
        { icon: <Cookie className="w-5 h-5" />, label: "Cookies", value: d.cookiesEnabled },
        { icon: <ShieldAlert className="w-5 h-5" />, label: "Do Not Track", value: d.doNotTrack },
        { icon: <ShieldAlert className="w-5 h-5" />, label: "Global Privacy Control", value: d.gpc },
        { icon: <Bot className="w-5 h-5" />, label: "Automation", value: d.webdriver },
      ],
    },
    {
      title: "Fingerprint",
      blurb: "Traits that quietly make your device identifiable.",
      fields: [
        { icon: <Fingerprint className="w-5 h-5" />, label: "Canvas Hash", value: d.canvasHash },
        { icon: <Palette className="w-5 h-5" />, label: "Fonts Detected", value: d.fonts },
        { icon: <ShieldAlert className="w-5 h-5" />, label: "Permission States", value: d.permissions, span: 2 },
      ],
    },
  ];

  const totalSignals = sections.reduce(
    (n, s) => n + s.fields.filter((f) => f.value).length,
    d.locationText ? 1 : 0,
  );

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      {/* Decorative background blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none -z-10" />

      <main className="container mx-auto px-4 pt-32 pb-16 relative z-10 flex flex-col items-center">

        {/* Hero */}
        <section className="w-full flex flex-col items-center text-center relative mb-20">
          <InteractiveGlobe
            location={d.coordinates}
            label={d.locationLabel}
            precise={d.precise}
          />

          <div className="mt-6 z-10 flex flex-col items-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl md:text-7xl font-light tracking-tight mb-4"
            >
              You are here.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              {d.loading
                ? "Reading the signals your browser is transmitting…"
                : <>Your device just quietly shared <span className="text-foreground font-medium">{totalSignals}</span> things about you. Here they are.</>}
            </motion.p>

            {/* precision badge + upgrade button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-5 flex items-center gap-3 flex-wrap justify-center"
            >
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                d.precise
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-500 dark:text-cyan-300"
                  : "border-border bg-muted/40 text-muted-foreground"
              }`}>
                <LocateFixed className="w-3.5 h-3.5" />
                {d.precise ? "Precise GPS location" : "Approximate (IP-based) location"}
              </span>
              {!d.precise && d.permissionState !== "denied" && (
                <Button size="sm" variant="outline" onClick={userData.requestPrecise} data-testid="button-precise">
                  <Crosshair className="w-4 h-4 mr-1.5" /> Use precise location
                </Button>
              )}
              {!d.precise && d.permissionState === "denied" && (
                <span className="text-xs text-muted-foreground">Location blocked — showing IP estimate.</span>
              )}
            </motion.div>
          </div>
        </section>

        {/* Featured location */}
        <section className="w-full max-w-6xl mx-auto mb-16">
          <GlassCard className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="w-6 h-6 shrink-0" />
              <span className="text-sm font-medium uppercase tracking-wide">You appear to be in</span>
            </div>
            <div className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-3">
              {d.loading ? <Skeleton className="h-10 w-64" /> : (
                <>
                  {d.countryFlag && <span>{d.countryFlag}</span>}
                  <span>{d.locationText || "Location unavailable"}</span>
                </>
              )}
            </div>
          </GlassCard>
        </section>

        {/* Data sections */}
        {sections.map((section) => {
          const fields = section.fields.filter((f) => f.value);
          if (!fields.length) return null;
          return (
            <section key={section.title} className="w-full max-w-6xl mx-auto mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                className="mb-8"
              >
                <h2 className="text-2xl md:text-3xl font-light tracking-tight">{section.title}</h2>
                <p className="text-muted-foreground mt-1 text-sm">{section.blurb}</p>
              </motion.div>

              <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {fields.map((f) => (
                  <motion.div
                    key={f.label}
                    variants={item}
                    className={f.span === 2 ? "sm:col-span-2" : ""}
                  >
                    <StatCard icon={f.icon} label={f.label} value={f.value} />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          );
        })}

      </main>

      <Footer />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <GlassCard className="h-full flex flex-col justify-between hover:bg-black/[0.03] dark:hover:bg-white/[0.06] transition-colors duration-300">
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="font-semibold tracking-tight text-lg text-foreground break-words">
        {value}
      </div>
    </GlassCard>
  );
}
