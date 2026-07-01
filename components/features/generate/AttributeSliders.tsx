"use client";

import { Slider } from "@/components/ui/slider";
import type { StyleAttributes } from "@/lib/replicate/prompt-builder";

interface AttributeSlidersProps {
  value: StyleAttributes;
  onChange: (value: StyleAttributes) => void;
}

const COLORS = [
  { label: "Natural", value: "" },
  { label: "Blonde", value: "blonde" },
  { label: "Brunette", value: "brunette" },
  { label: "Black", value: "jet black" },
  { label: "Red", value: "vibrant red" },
  { label: "Auburn", value: "auburn" },
  { label: "Platinum", value: "platinum blonde" },
  { label: "Silver", value: "silver grey" },
];

function lengthLabel(v: number) {
  if (v <= 15) return "Buzz cut";
  if (v <= 35) return "Short";
  if (v <= 60) return "Medium";
  if (v <= 80) return "Shoulder";
  return "Long";
}

function curlLabel(v: number) {
  if (v <= 20) return "Straight";
  if (v <= 45) return "Wavy";
  if (v <= 70) return "Curly";
  return "Coily";
}

function highlightLabel(v: number) {
  if (v <= 15) return "None";
  if (v <= 50) return "Subtle";
  return "Bold";
}

export function AttributeSliders({ value, onChange }: AttributeSlidersProps) {
  function update(key: keyof StyleAttributes, val: number | string) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Length</span>
          <span className="text-muted-foreground">{lengthLabel(value.length)}</span>
        </div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[value.length]}
          onValueChange={(v) => update("length", Array.isArray(v) ? v[0] : v)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Texture</span>
          <span className="text-muted-foreground">{curlLabel(value.curl)}</span>
        </div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[value.curl]}
          onValueChange={(v) => update("curl", Array.isArray(v) ? v[0] : v)}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Color</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => update("color", c.value)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors
                ${value.color === c.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30 hover:border-primary/50"
                }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Highlights</span>
          <span className="text-muted-foreground">{highlightLabel(value.highlight)}</span>
        </div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[value.highlight]}
          onValueChange={(v) => update("highlight", Array.isArray(v) ? v[0] : v)}
        />
      </div>
    </div>
  );
}
