"use client";

import type { Series } from "@/lib/types";

export function Shelf({
  seriesList,
  onDeleted,
  onRequestNewSeries,
}: {
  seriesList: Series[];
  onDeleted: () => void;
  onRequestNewSeries: () => void;
}) {
  async function handleDelete(id: string, name: string) {
    if (!confirm(`Retirer « ${name} » de l'étagère ? Les livres resteront, mais deviendront indépendants.`)) {
      return;
    }
    await fetch(`/api/series/${id}`, { method: "DELETE" });
    onDeleted();
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-display text-2xl" style={{ color: "var(--text-on-paper)" }}>
          L&apos;étagère
        </h2>
        <button
          onClick={onRequestNewSeries}
          className="text-sm underline underline-offset-4"
          style={{ color: "var(--wine)" }}
        >
          Nouvelle série
        </button>
      </div>

      {seriesList.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-on-paper-dim)" }}>
          Rien sur l&apos;étagère pour l&apos;instant. Les livres indépendants n&apos;ont pas
          besoin d&apos;y figurer.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {seriesList.map((s) => (
            <div
              key={s.id}
              className="group relative flex items-end gap-2 rounded-sm px-4 py-3 min-h-20"
              style={{
                background: "var(--wine)",
                color: "var(--text-on-ink)",
                borderLeft: "3px solid var(--gold)",
              }}
            >
              <div>
                <p className="font-display text-base leading-tight">{s.name}</p>
                <p className="text-xs mt-1" style={{ color: "var(--gold-soft)" }}>
                  {s.books?.length ?? 0} tome{(s.books?.length ?? 0) > 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => handleDelete(s.id, s.name)}
                aria-label={`Retirer ${s.name}`}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-2"
                style={{ color: "var(--gold-soft)" }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
