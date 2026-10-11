"use client";

import { useState } from "react";
import type { Series } from "@/lib/types";

const fieldStyle = {
  border: "1px solid var(--paper-line)",
  color: "var(--text-on-paper)",
} as const;

export function BookForm({
  seriesList,
  onCreated,
}: {
  seriesList: Series[];
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [orderInSeries, setOrderInSeries] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle("");
    setDescription("");
    setPrice("");
    setCoverUrl("");
    setSeriesId("");
    setOrderInSeries("");
    setPublishDate("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(price);
    if (!title.trim()) return setError("Le titre est requis");
    if (!priceNum || priceNum <= 0) return setError("Le prix doit être un nombre positif");

    setSubmitting(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          price: priceNum,
          coverUrl: coverUrl || undefined,
          seriesId: seriesId || undefined,
          orderInSeries: orderInSeries ? parseInt(orderInSeries, 10) : undefined,
          publishDate: publishDate ? new Date(publishDate).toISOString() : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.formErrors?.[0] ?? "Erreur à la création");
      }

      reset();
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 space-y-5"
      style={{ background: "var(--paper-dim)", borderLeft: "3px solid var(--gold)" }}
    >
      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--text-on-paper-dim)" }}>
          Titre
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tome 1 — L'éveil"
          className="w-full px-3 py-2 text-base font-display bg-transparent"
          style={fieldStyle}
        />
      </div>

      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--text-on-paper-dim)" }}>
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm bg-transparent"
          style={fieldStyle}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-on-paper-dim)" }}>
            Prix
          </label>
          <div className="flex items-center" style={fieldStyle}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="12.90"
              className="w-full px-3 py-2 text-sm bg-transparent outline-none"
            />
            <span className="pr-3 text-sm" style={{ color: "var(--text-on-paper-dim)" }}>
              €
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-on-paper-dim)" }}>
            Couverture (URL)
          </label>
          <input
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 text-sm bg-transparent"
            style={fieldStyle}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-on-paper-dim)" }}>
            Série
          </label>
          <select
            value={seriesId}
            onChange={(e) => setSeriesId(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-transparent"
            style={fieldStyle}
          >
            <option value="">Livre indépendant</option>
            {seriesList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-on-paper-dim)" }}>
            Tome n°
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={orderInSeries}
            onChange={(e) => setOrderInSeries(e.target.value)}
            disabled={!seriesId}
            placeholder="1"
            className="w-full px-3 py-2 text-sm bg-transparent disabled:opacity-40"
            style={fieldStyle}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--text-on-paper-dim)" }}>
          Date de sortie — vide pour un brouillon
        </label>
        <input
          type="datetime-local"
          value={publishDate}
          onChange={(e) => setPublishDate(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-transparent"
          style={fieldStyle}
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
        className="px-5 py-2.5 text-sm disabled:opacity-50"
        style={{ background: "var(--ink)", color: "var(--text-on-ink)" }}
      >
        {submitting ? "Écriture..." : "Inscrire au catalogue"}
      </button>
    </form>
  );
}
