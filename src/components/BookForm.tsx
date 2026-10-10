"use client";

import { useState } from "react";
import type { Series } from "@/lib/types";

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
  const [publishDate, setPublishDate] = useState(""); // datetime-local
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
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-medium text-neutral-900">Nouveau livre</h3>

      <div>
        <label className="block text-xs text-neutral-600 mb-1">Titre</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tome 1 - L'éveil"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs text-neutral-600 mb-1">Description (optionnel)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-600 mb-1">Prix (€)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="12.90"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-600 mb-1">Photo de couverture (URL, optionnel)</label>
          <input
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-600 mb-1">Série (optionnel)</label>
          <select
            value={seriesId}
            onChange={(e) => setSeriesId(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm bg-white"
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
          <label className="block text-xs text-neutral-600 mb-1">Position dans la série</label>
          <input
            type="number"
            min="1"
            step="1"
            value={orderInSeries}
            onChange={(e) => setOrderInSeries(e.target.value)}
            disabled={!seriesId}
            placeholder="1, 2, 3..."
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100 disabled:text-neutral-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-neutral-600 mb-1">
          Date de sortie programmée (laisser vide = brouillon)
        </label>
        <input
          type="datetime-local"
          value={publishDate}
          onChange={(e) => setPublishDate(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        {submitting ? "Création..." : "Créer le livre"}
      </button>
    </form>
  );
}
