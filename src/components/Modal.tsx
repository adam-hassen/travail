"use client";

import { useEffect } from "react";

export function Modal({
  children,
  onClose,
  label,
}: {
  children: React.ReactNode;
  onClose: () => void;
  label?: string;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-panel relative w-full max-w-2xl my-6 sm:my-0"
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center text-sm z-10"
          style={{
            background: "var(--ink)",
            color: "var(--text-on-ink)",
            borderRadius: "50%",
            boxShadow: "0 4px 14px -4px var(--shadow-ink)",
          }}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
