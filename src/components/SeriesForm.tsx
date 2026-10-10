"use client";

import { useState } from "react";

export function SeriesForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Le nom de la série est requis");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.formErrors?.[0] ?? "Erreur à la création");
      }

      setName("");
      setDescription("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-medium text-neutral-900">Nouvelle série</h3>
      <div>
        <label className="block text-xs text-neutral-600 mb-1">Nom</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="La saga du vent"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-600 mb-1">Description (optionnel)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        {submitting ? "Création..." : "Créer la série"}
      </button>
    </form>
  );
}
