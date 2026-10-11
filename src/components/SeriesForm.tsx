"use client";

import { useState } from "react";

export function SeriesForm({ onCreated }: { onCreated: (name: string) => void }) {
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

      const savedName = name;
      setName("");
      setDescription("");
      onCreated(savedName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 p-5"
      style={{ background: "var(--paper-dim)", borderLeft: "3px solid var(--wine)", borderRadius: 3 }}
    >
      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--text-on-paper-dim)" }}>
          Nom de la série
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="La saga du vent"
          className="field w-full px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--text-on-paper-dim)" }}>
          Description (optionnel)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="field w-full px-3 py-2 text-sm"
        />
      </div>
      {error && (
        <p className="text-sm" style={{ color: "var(--wine)" }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 text-sm disabled:opacity-50"
        style={{ background: "var(--wine)", color: "var(--text-on-ink)", borderRadius: 3 }}
      >
        {submitting ? "Création..." : "Ajouter à l'étagère"}
      </button>
    </form>
  );
}
