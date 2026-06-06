"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cities } from "@/data/cities";
import { cn } from "@/lib/utils";

interface CitySelectDropdownProps {
  value: string | null;
  onChange: (cityId: string) => void;
  excludeCityId: string | null;
  placeholder: string;
}

export function CitySelectDropdown({
  value,
  onChange,
  excludeCityId,
  placeholder,
}: CitySelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedCity = cities.find((city) => city.id === value);
  const options = cities.filter((city) => city.id !== excludeCityId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative w-full min-w-[240px] flex-1 sm:min-w-[280px] sm:max-w-[340px]">
      <p className="mb-2 text-center text-[10px] font-semibold tracking-[0.18em] text-muted uppercase">
        Select City:
      </p>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border border-border bg-card/90 px-5 py-3.5 text-sm shadow-sm backdrop-blur-sm transition-colors",
          "hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={cn(
            "truncate",
            selectedCity ? "font-medium text-foreground" : "text-muted",
          )}
        >
          {selectedCity?.name ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1.5 max-h-52 w-full overflow-auto rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          {options.map((city) => (
            <li key={city.id}>
              <button
                type="button"
                role="option"
                aria-selected={value === city.id}
                onClick={() => {
                  onChange(city.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface",
                  value === city.id && "bg-brand/10 font-medium text-brand",
                )}
              >
                {city.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
