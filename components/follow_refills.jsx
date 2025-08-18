"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function PillSelect({
  value,
  onChange,
  options = [],
  counts = {},
  labelPrefix = "",
  formatUnit = "",
  tone = {
    bg: "bg-secondary",
    text: "text-white",
    badge: "bg-secondary-foreground text-white",
  },
  className = "",
  placeholder = "Select",
  showTotal = false,        // ✅ new flag
}) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  // Ensure "all" first
  const normalizedOptions = useMemo(() => {
    if (!options?.length) return [];
    const rest = options.filter((o) => o !== "all");
    return options.includes("all") ? ["all", ...rest] : options;
  }, [options]);

  const formatLabel = (v) => {
    if (!v) return placeholder;
    let core =
      v === "all" ? "All" :
      v === "None" ? "None" :
      formatUnit === "d" ? v.replace("d", " Days") :
      formatUnit === "w" ? v.replace("w", " Weeks") : v;

    return labelPrefix ? `${labelPrefix} ${core}` : core;
  };

  const selectedLabel = useMemo(() => formatLabel(value), [value]);
  const selectedCount = counts?.[value] ?? 0;

  // ✅ calculate total count
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const onTriggerKeyDown = (e) => {
    if (["Enter", " ", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
      const idx = Math.max(0, normalizedOptions.findIndex((o) => o === value));
      setActiveIdx(idx === -1 ? 0 : idx);
      setTimeout(() => listRef.current?.focus(), 0);
    }
  };

  const onListKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(normalizedOptions.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < normalizedOptions.length) {
        const sel = normalizedOptions[activeIdx];
        onChange?.(sel);
        setOpen(false);
        buttonRef.current?.focus();
      }
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  const selectOption = (opt, idx) => {
    onChange?.(opt);
    setActiveIdx(idx);
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div
      ref={rootRef}
      className={`relative inline-block ${className}`}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls="pillselect-listbox"
      aria-activedescendant={
        activeIdx >= 0 ? `pillselect-opt-${activeIdx}` : undefined
      }
    >
      {/* Trigger */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        className={`relative flex items-center gap-2 px-5 py-2 rounded-full cursor-pointer border ${tone.bg} ${tone.text}`}
      >
        <span className="text-sm font-medium truncate max-w-[180px]">
          {selectedLabel}
        </span>

        {/* ✅ Floating badge: either selectedCount or totalCount */}
        {(showTotal ? totalCount : selectedCount) > 0 && (
          <span
            className={`absolute -top-2 -right-2 py-0.5 px-2 rounded-full text-xs ${tone.badge}`}
          >
            {showTotal ? totalCount : selectedCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-2 min-w-[240px] rounded-md border bg-popover shadow-md"
          role="listbox"
          id="pillselect-listbox"
          tabIndex={-1}
          ref={listRef}
          onKeyDown={onListKeyDown}
        >
          <ul className="py-1 max-h-64 overflow-y-auto">
            {normalizedOptions.map((opt, idx) => {
              const label = formatLabel(opt);
              const c = counts?.[opt] ?? 0;
              const isSelected = opt === value;
              const isActive = idx === activeIdx;

              return (
                <li
                  key={opt}
                  id={`pillselect-opt-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`flex items-center justify-between gap-3 px-3 py-2 cursor-pointer text-sm ${
                    isActive ? "bg-muted" : "hover:bg-muted/70"
                  }`}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(opt, idx)}
                >
                  <span className={`truncate ${isSelected ? "font-medium" : ""}`}>
                    {label}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      c > 0 ? "bg-muted-foreground/10" : "bg-transparent text-muted-foreground"
                    }`}
                  >
                    {c}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
