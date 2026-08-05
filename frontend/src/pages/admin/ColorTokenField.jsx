import React from "react";
import { Palette, Check } from "lucide-react";
import { BRAND_COLORS, isHexColor, brandColorName } from "../../utils/brandColors";

/**
 * Colour control offering the studio tokens plus a free custom colour.
 *
 * Three ways in, because a quote may need either a brand colour or a client's own:
 * a token swatch, the OS colour picker, or a typed hex.
 */
export default function ColorTokenField({
  label,
  value,
  fallback,
  onChange,
  hint,
  // Adds a "None" choice that clears the value. Needed where the absence of a
  // colour is a real option (a grid sitting transparent on the page background)
  // rather than just "use the default".
  allowEmpty = false,
  emptyLabel = "None",
}) {
  const current = (value || "").trim();
  const effective = current || fallback || "";
  const tokenName = brandColorName(effective);
  const isEmpty = allowEmpty && !current;

  return (
    <div className="input-group space-y-2">
      <label style={{ fontSize: 11 }}>{label}</label>

      <div className="flex items-center gap-2">
        <input
          type="color"
          // <input type="color"> only accepts #rrggbb. A half-typed hex in the text
          // field must not be pushed into it, or React logs a warning every keystroke.
          value={isHexColor(effective) ? effective : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          aria-label={`${label} colour picker`}
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <input
          type="text"
          value={current}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fallback || "#123524"}
          className="custom-input flex-1 font-mono uppercase text-xs"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {allowEmpty && (
          <button
            type="button"
            title={`${emptyLabel} · transparent`}
            aria-label={emptyLabel}
            aria-pressed={isEmpty}
            onClick={() => onChange("")}
            className="text-[9px] font-bold uppercase tracking-wide"
            style={{
              height: 22,
              padding: "0 7px",
              borderRadius: 6,
              // Checkerboard reads as "transparent" the way image editors show it.
              backgroundImage:
                "linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%), linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%)",
              backgroundSize: "8px 8px",
              backgroundPosition: "0 0, 4px 4px",
              border: isEmpty ? "2px solid #123524" : "1px solid rgba(0,0,0,0.18)",
              boxShadow: isEmpty ? "0 0 0 2px rgba(18,53,36,0.18)" : "none",
              color: "#374151",
              cursor: "pointer",
            }}
          >
            {emptyLabel}
          </button>
        )}
        {BRAND_COLORS.map((c) => {
          const active = !isEmpty && effective.toLowerCase() === c.hex.toLowerCase();
          return (
            <button
              key={c.hex}
              type="button"
              title={`${c.name} · ${c.hex}`}
              aria-label={c.name}
              aria-pressed={active}
              onClick={() => onChange(c.hex)}
              style={{
                backgroundColor: c.hex,
                width: 22,
                height: 22,
                borderRadius: 6,
                // Pale tokens would vanish against the panel without a border.
                border: active ? "2px solid #123524" : "1px solid rgba(0,0,0,0.18)",
                boxShadow: active ? "0 0 0 2px rgba(18,53,36,0.18)" : "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {active && (
                <Check
                  style={{
                    width: 12,
                    height: 12,
                    // Tick has to invert on light tokens to stay visible.
                    color: ["#FFFFFF", "#F5F5F5", "#FFF6E9", "#FFD221", "#D9D5B0", "#97D9AF", "#FDB5ED"].includes(c.hex)
                      ? "#123524"
                      : "#FFFFFF",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-gray-500 flex items-center gap-1">
        <Palette style={{ width: 11, height: 11 }} className="shrink-0" />
        <span>
          {isEmpty
            ? `${emptyLabel} — transparent`
            : tokenName
            ? `Studio token: ${tokenName}`
            : effective
            ? "Custom colour"
            : "Using default"}
          {hint ? ` · ${hint}` : ""}
        </span>
      </p>
    </div>
  );
}
