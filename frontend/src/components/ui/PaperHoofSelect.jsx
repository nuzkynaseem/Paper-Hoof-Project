import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function PaperHoofSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select an option...",
  disabled = false,
  className = "",
  style = {},
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const handleSelect = (optionValue) => {
    if (disabled) return;
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left ${className}`}
      style={style}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-white border border-[#d1d5db] rounded-xl text-xs font-bold text-[#123524] transition-all shadow-sm cursor-pointer ${
          isOpen ? "border-[#123524] ring-2 ring-[#97d9af]/40 shadow-md" : "hover:border-[#97d9af] hover:shadow"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#123524] transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Floating Dark Glassmorphic Popover Menu (Matches user screenshot) */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-64 overflow-y-auto bg-[#333333]/95 backdrop-blur-md border border-[#444444] rounded-xl shadow-2xl p-1.5 text-white animate-in fade-in zoom-in-95 duration-150">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400 text-center font-medium">
              No options available
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left cursor-pointer ${
                    isSelected
                      ? "bg-[#444444] text-white font-bold"
                      : "hover:bg-[#444444]/70 text-gray-200"
                  }`}
                >
                  <span className="w-4 h-4 flex items-center justify-center shrink-0">
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#97d9af]" />}
                  </span>
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
