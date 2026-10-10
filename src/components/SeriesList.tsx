"use client";

import type { Series } from "@/lib/types";

export function SeriesList({
  seriesList,
  onDeleted,
}: {
  seriesList: Series[];
  onDeleted: () => void;
}) {
  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette série ? (les livres resteront, mais deviendront indépendants)")) return;
    await fetch(`/api/series/${id}`, { method: "DELETE" });
    onDeleted();
  }

  if (seriesList.length === 0) {
    return <p className="text-sm text-neutral-500">Aucune série pour l'instant.</p>;
  }

  return (
    <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
      {seriesList.map((s) => (
        <li key={s.id} className="flex items-center justify-between px-3 py-2 text-sm">
          <span className="text-neutral-900">{s.name}</span>
          <button
            onClick={() => handleDelete(s.id)}
            className="text-xs text-red-600 hover:underline"
          >
            Supprimer
          </button>
        </li>
      ))}
    </ul>
  );
}
