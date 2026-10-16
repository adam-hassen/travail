"use client";

import { useEffect, useRef, useState } from "react";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const DAYS = ["L", "M", "M", "J", "V", "S", "D"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function sameDay(a: Date | null, b: Date) {
  return !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isPastDay(day: Date, today: Date) {
  const d = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return d < t;
}

function buildGrid(monthStart: Date) {
  // lundi = 0 ... dimanche = 6
  const firstWeekday = (monthStart.getDay() + 6) % 7;
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), d));
  }
  return cells;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Choisir une date",
}: {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(value ?? new Date()));
  const [time, setTime] = useState(() =>
    value
      ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
      : "09:00"
  );
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const cells = buildGrid(viewMonth);
  const today = new Date();
  const isCurrentMonthView =
    viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth();
  const selectedIsToday = sameDay(value, today);
  const minTime = selectedIsToday
    ? `${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`
    : undefined;

  function pickDay(day: Date) {
    let [h, m] = time.split(":").map(Number);
    // Si on choisit aujourd'hui avec une heure déjà passée, on recale sur
    // l'heure actuelle plutôt que de laisser passer une date révolue.
    if (sameDay(today, day)) {
      const chosen = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h || 0, m || 0);
      if (chosen < today) {
        h = today.getHours();
        m = today.getMinutes();
        setTime(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      }
    }
    const next = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h || 0, m || 0);
    onChange(next);
  }

  function applyTime(newTime: string) {
    // Si le jour sélectionné est aujourd'hui, on refuse une heure déjà passée.
    if (selectedIsToday) {
      const [h, m] = newTime.split(":").map(Number);
      const candidate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h || 0, m || 0);
      if (candidate < today) return;
    }
    setTime(newTime);
    if (value) {
      const [h, m] = newTime.split(":").map(Number);
      const next = new Date(value);
      next.setHours(h || 0, m || 0);
      onChange(next);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="field w-full px-3 py-2 text-sm text-left flex items-center justify-between"
        style={{ color: value ? "var(--text-on-paper)" : "var(--text-on-paper-dim)" }}
      >
        <span>
          {value
            ? `${value.getDate()} ${MONTHS[value.getMonth()]} ${value.getFullYear()} · ${time}`
            : placeholder}
        </span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="2" y="3" width="12" height="11" rx="1" stroke="var(--text-on-paper-dim)" strokeWidth="1.2" />
          <path d="M2 6.5H14" stroke="var(--text-on-paper-dim)" strokeWidth="1.2" />
          <path d="M5 1.5V4M11 1.5V4" stroke="var(--text-on-paper-dim)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-20 mt-2 p-4 w-72"
          style={{ background: "var(--paper)", border: "1px solid var(--paper-line)", boxShadow: "0 8px 24px rgba(21,23,31,0.18)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              disabled={isCurrentMonthView}
              aria-label="Mois précédent"
              className="px-2 py-1 text-sm disabled:opacity-30"
              style={{ color: "var(--wine)" }}
            >
              ‹
            </button>
            <p className="font-display text-sm" style={{ color: "var(--text-on-paper)" }}>
              {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </p>
            <button
              type="button"
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              aria-label="Mois suivant"
              className="px-2 py-1 text-sm"
              style={{ color: "var(--wine)" }}
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((d, i) => (
              <div key={i} className="text-center text-xs py-1" style={{ color: "var(--text-on-paper-dim)" }}>
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const isSelected = sameDay(value, day);
              const isToday = sameDay(today, day);
              const disabled = isPastDay(day, today);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pickDay(day)}
                  disabled={disabled}
                  className="h-8 text-sm disabled:opacity-25 disabled:cursor-not-allowed"
                  style={{
                    background: isSelected ? "var(--wine)" : "transparent",
                    color: isSelected ? "var(--text-on-ink)" : "var(--text-on-paper)",
                    border: isToday && !isSelected ? "1px solid var(--gold)" : "1px solid transparent",
                  }}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid var(--paper-line)" }}>
            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-on-paper-dim)" }}>
              Heure
              <input
                type="time"
                value={time}
                min={minTime}
                onChange={(e) => applyTime(e.target.value)}
                className="px-2 py-1 text-sm bg-transparent"
                style={{ border: "1px solid var(--paper-line)", color: "var(--text-on-paper)" }}
              />
            </label>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="text-sm underline underline-offset-4"
                style={{ color: "var(--text-on-paper-dim)" }}
              >
                Effacer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
