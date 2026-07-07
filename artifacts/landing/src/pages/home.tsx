import { InteractiveGlobe } from "@/components/globe";
import { useUserData } from "@/hooks/use-user-data";
import { GlassCard } from "@/components/ui/glass-card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { 
  MapPin, Clock, Monitor, Globe as GlobeIcon, 
  Cpu, Battery, Wifi, Fingerprint, ShieldAlert,
  Activity, Maximize, Palette, Layers, MonitorSmartphone
} from "lucide-react";
import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const userData = useUserData();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      {/* Decorative background blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none -z-10" />

      <main className="container mx-auto px-4 pt-32 pb-16 relative z-10 flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center text-center relative mb-24">
          {/* Globe — in flow, receives all pointer events */}
          <InteractiveGlobe location={userData.coordinates} />

          {/* Text sits below the globe, no z-index conflict */}
          <div className="mt-6 z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-5xl md:text-7xl font-light tracking-tight mb-4"
            >
              You are here.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Every interaction leaves a trace. A digital fingerprint of your existence, rendered in real-time.
            </motion.p>
          </div>
        </section>

        {/* Data Section */}
        <section className="w-full max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-light tracking-tight">Your Digital Trace</h2>
            <p className="text-muted-foreground mt-2">Browser-detectable signals transmitted by your device.</p>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {/* Location Card */}
            <motion.div variants={item} className="md:col-span-2 lg:col-span-2">
              <StatCard 
                icon={<MapPin className="w-5 h-5" />}
                label="Approximate Location"
                value={
                  userData.loading ? <Skeleton className="h-8 w-48" /> : 
                  userData.error ? "Location unavailable" : 
                  userData.locationText
                }
                valueClassName="text-2xl md:text-3xl text-foreground"
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard 
                icon={<Clock className="w-5 h-5" />}
                label="Local Time"
                value={userData.localTime}
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard 
                icon={<GlobeIcon className="w-5 h-5" />}
                label="Timezone"
                value={userData.timezone}
              />
            </motion.div>

            <motion.div variants={item} className="md:col-span-2">
              <StatCard 
                icon={<Monitor className="w-5 h-5" />}
                label="Browser & OS"
                value={userData.browserOS}
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard 
                icon={<Maximize className="w-5 h-5" />}
                label="Screen Resolution"
                value={userData.screenResolution}
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard 
                icon={<Palette className="w-5 h-5" />}
                label="Color Depth"
                value={userData.colorDepth}
              />
            </motion.div>

            {userData.deviceMemory && (
              <motion.div variants={item}>
                <StatCard 
                  icon={<Layers className="w-5 h-5" />}
                  label="Device Memory"
                  value={userData.deviceMemory}
                />
              </motion.div>
            )}

            <motion.div variants={item}>
              <StatCard 
                icon={<Cpu className="w-5 h-5" />}
                label="Logical Cores"
                value={userData.cpuCores}
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard 
                icon={<Activity className="w-5 h-5" />}
                label="Language"
                value={userData.language}
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard 
                icon={<Wifi className="w-5 h-5" />}
                label="Online Status"
                value={userData.onlineStatus}
              />
            </motion.div>

            {userData.connectionType && (
              <motion.div variants={item}>
                <StatCard 
                  icon={<Wifi className="w-5 h-5" />}
                  label="Connection Type"
                  value={userData.connectionType.toUpperCase()}
                />
              </motion.div>
            )}

            {userData.battery && (
              <motion.div variants={item}>
                <StatCard 
                  icon={<Battery className="w-5 h-5" />}
                  label="Battery"
                  value={userData.battery}
                />
              </motion.div>
            )}

            <motion.div variants={item}>
              <StatCard 
                icon={<Fingerprint className="w-5 h-5" />}
                label="Cookies"
                value={userData.cookiesEnabled}
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard 
                icon={<ShieldAlert className="w-5 h-5" />}
                label="Do Not Track"
                value={userData.doNotTrack}
              />
            </motion.div>

            <motion.div variants={item}>
              <StatCard 
                icon={<MonitorSmartphone className="w-5 h-5" />}
                label="Touch Support"
                value={userData.touchSupport}
              />
            </motion.div>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

function StatCard({ icon, label, value, valueClassName = "text-xl text-foreground" }: { icon: ReactNode, label: string, value: ReactNode, valueClassName?: string }) {
  return (
    <GlassCard className="h-full flex flex-col justify-between hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-300">
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className={`font-semibold tracking-tight ${valueClassName}`}>
        {value}
      </div>
    </GlassCard>
  );
}
