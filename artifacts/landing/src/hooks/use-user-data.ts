import { useState, useEffect } from "react";

export interface UserData {
  locationText: string | null;
  coordinates: [number, number] | null;
  loading: boolean;
  error: boolean;
  timezone: string;
  localTime: string;
  browserOS: string;
  screenResolution: string;
  colorDepth: string;
  deviceMemory: string | null;
  language: string;
  onlineStatus: string;
  battery: string | null;
  connectionType: string | null;
  cookiesEnabled: string;
  doNotTrack: string;
  cpuCores: string;
  touchSupport: string;
}

export function useUserData() {
  const [data, setData] = useState<UserData>({
    locationText: null,
    coordinates: null,
    loading: true,
    error: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    localTime: new Date().toLocaleTimeString(),
    browserOS: "",
    screenResolution: `${window.screen.width} x ${window.screen.height}`,
    colorDepth: `${window.screen.colorDepth}-bit`,
    deviceMemory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : null,
    language: navigator.language || "Unknown",
    onlineStatus: navigator.onLine ? "Online" : "Offline",
    battery: null,
    connectionType: (navigator as any).connection?.effectiveType || null,
    cookiesEnabled: navigator.cookieEnabled ? "Enabled" : "Disabled",
    doNotTrack: navigator.doNotTrack === "1" ? "Enabled" : "Disabled",
    cpuCores: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : "Unknown",
    touchSupport: navigator.maxTouchPoints > 0 ? `Yes (${navigator.maxTouchPoints} points)` : "No",
  });

  useEffect(() => {
    // Update local time every second
    const timer = setInterval(() => {
      setData(prev => ({ ...prev, localTime: new Date().toLocaleTimeString() }));
    }, 1000);

    // Browser & OS simplified parsing
    const ua = navigator.userAgent;
    let browserOS = "Unknown";
    
    if ((navigator as any).userAgentData) {
      const platform = (navigator as any).userAgentData.platform;
      const browser = (navigator as any).userAgentData.brands[0]?.brand || "Unknown";
      browserOS = `${browser} on ${platform}`;
    } else {
      let browser = "Unknown";
      if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Safari")) browser = "Safari";
      else if (ua.includes("Edge")) browser = "Edge";
      else if (ua.includes("MSIE") || ua.includes("Trident/")) browser = "Internet Explorer";
      
      let os = "Unknown OS";
      if (ua.includes("Win")) os = "Windows";
      else if (ua.includes("Mac")) os = "MacOS";
      else if (ua.includes("X11")) os = "UNIX";
      else if (ua.includes("Linux")) os = "Linux";
      
      browserOS = `${browser} on ${os}`;
    }

    setData(prev => ({ ...prev, browserOS }));

    // Battery
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setData(prev => ({
            ...prev,
            battery: `${Math.round(battery.level * 100)}% (${battery.charging ? 'Charging' : 'Discharging'})`
          }));
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      });
    }

    // IP Location
    const fetchLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) throw new Error("Network response was not ok");
        const json = await response.json();
        
        if (json.error) {
          throw new Error(json.reason || "API Error");
        }

        setData(prev => ({
          ...prev,
          loading: false,
          locationText: `${json.city || "Unknown"}, ${json.country_name || "Unknown"}`,
          coordinates: json.latitude && json.longitude ? [json.latitude, json.longitude] : null,
        }));
      } catch (error) {
        console.error("Failed to fetch location:", error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: true,
          locationText: "Location unavailable",
        }));
      }
    };

    fetchLocation();

    return () => clearInterval(timer);
  }, []);

  return data;
}
