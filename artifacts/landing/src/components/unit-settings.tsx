import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { resolveUnits, type UnitSettings } from "@/hooks/use-user-data";

interface Props {
  settings: UnitSettings;
  onChange: (changes: Partial<UnitSettings>) => void;
}

// Each row drives one measurement. `field` is the UnitSettings key we write;
// `resolved` is the ResolvedUnits key we read to highlight the active option.
const ROWS: {
  field: keyof UnitSettings;
  resolved: "temp" | "wind" | "pressure" | "distance";
  label: string;
  options: { value: string; label: string }[];
}[] = [
  { field: "temperature", resolved: "temp", label: "Temperature",
    options: [{ value: "F", label: "°F" }, { value: "C", label: "°C" }] },
  { field: "windSpeed", resolved: "wind", label: "Wind",
    options: [{ value: "mph", label: "mph" }, { value: "kmh", label: "km/h" }, { value: "ms", label: "m/s" }] },
  { field: "pressure", resolved: "pressure", label: "Pressure",
    options: [{ value: "inHg", label: "inHg" }, { value: "hPa", label: "hPa" }, { value: "mmHg", label: "mmHg" }] },
  { field: "distance", resolved: "distance", label: "Elevation",
    options: [{ value: "ft", label: "ft" }, { value: "m", label: "m" }] },
];

export function UnitSettingsMenu({ settings, onChange }: Props) {
  const resolved = resolveUnits(settings);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-10 h-10 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all backdrop-blur-md"
          aria-label="Measurement units"
          data-testid="button-units"
        >
          <Settings2 className="h-[1.2rem] w-[1.2rem] text-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72">
        <div className="space-y-1 mb-4">
          <p className="text-sm font-medium">Units</p>
          <p className="text-xs text-muted-foreground">
            How measurements are shown. Nothing is stored — resets on reload.
          </p>
        </div>

        {/* Imperial / Metric preset — sets every field back to "auto" under the
            chosen system. */}
        <div className="flex gap-2 mb-4">
          {(["imperial", "metric"] as const).map((system) => {
            const active = resolved.imperial === (system === "imperial");
            return (
              <Button
                key={system}
                size="sm"
                variant={active ? "default" : "outline"}
                className="flex-1 capitalize"
                onClick={() =>
                  onChange({ units: system, temperature: "auto", windSpeed: "auto", pressure: "auto", distance: "auto" })
                }
                data-testid={`preset-${system}`}
              >
                {system}
              </Button>
            );
          })}
        </div>

        <div className="space-y-3">
          {ROWS.map((row) => (
            <div key={row.field} className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <ToggleGroup
                type="single"
                value={resolved[row.resolved] as string}
                onValueChange={(v) => { if (v) onChange({ [row.field]: v } as Partial<UnitSettings>); }}
                className="gap-1"
              >
                {row.options.map((o) => (
                  <ToggleGroupItem
                    key={o.value}
                    value={o.value}
                    aria-label={o.label}
                    className="h-7 px-2.5 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    data-testid={`unit-${row.field}-${o.value}`}
                  >
                    {o.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
