"use client";

import { useRef, useState } from "react";
import type { Series } from "@/lib/types";
import { DatePicker } from "./DatePicker";
import { fileToCoverDataUrl } from "@/lib/image";

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
  const [publishDate, setPublishDate] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTitle("");
    setDescription("");
    setPrice("");
    setCoverUrl("");
    setSeriesId("");
    setOrderInSeries("");
    setPublishDate(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Le fichier choisi n'est pas une image");
      return;
    }

    setError(null);
    setImageLoading(true);
    try {
      const dataUrl = await fileToCoverDataUrl(file);
      setCoverUrl(dataUrl);
    } catch {
      setError("Impossible de lire cette photo, essaie une autre image");
    } finally {
      setImageLoading(false);
    }
  }

  function removePhoto() {
    setCoverUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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
          publishDate: publishDate ? publishDate.toISOString() : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.formErrors?.[0] ?? "Erreur à la création");
      }

      const savedTitle = title;
      reset();
      onCreated();
      setSuccess(
        publishDate
          ? `« ${savedTitle} » est inscrit et programmé. Il passera en « Publié » automatiquement à la date prévue.`
          : `« ${savedTitle} » est inscrit comme brouillon. Ajoute une date de sortie quand tu seras prête à le programmer.`
      );
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
      style={{ background: "var(--paper-dim)", borderLeft: "3px solid var(--gold)", borderRadius: 3 }}
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
          className="field w-full px-3 py-2 text-base font-display"
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
          className="field w-full px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-on-paper-dim)" }}>
            Prix
          </label>
          <div className="field flex items-center">
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
            Photo de couverture
          </label>
          <div className="flex items-center gap-3">
            {coverUrl ? (
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverUrl}
                  alt="Aperçu de la couverture"
                  className="w-14 h-20 object-cover"
                  style={{ borderRadius: 3, border: "1px solid var(--paper-line)" }}
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  aria-label="Retirer la photo"
                  className="absolute -top-2 -right-2 w-5 h-5 text-xs flex items-center justify-center"
                  style={{ background: "var(--wine)", color: "var(--text-on-ink)", borderRadius: "50%" }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                className="w-14 h-20 shrink-0 flex items-center justify-center text-xs text-center"
                style={{ background: "var(--paper)", border: "1px dashed var(--paper-line)", borderRadius: 3, color: "var(--text-on-paper-dim)" }}
              >
                aucune
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
                id="cover-photo-input"
              />
              <label
                htmlFor="cover-photo-input"
                className="field inline-block px-3 py-2 text-sm cursor-pointer"
              >
                {imageLoading ? "Chargement..." : coverUrl ? "Changer la photo" : "Choisir une photo"}
              </label>
              <p className="text-xs mt-1" style={{ color: "var(--text-on-paper-dim)" }}>
                Depuis l&apos;ordinateur ou le téléphone
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1" style={{ color: "var(--text-on-paper-dim)" }}>
            Série
          </label>
          <select
            value={seriesId}
            onChange={(e) => setSeriesId(e.target.value)}
            className="field w-full px-3 py-2 text-sm"
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
            className="field w-full px-3 py-2 text-sm disabled:opacity-40"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1" style={{ color: "var(--text-on-paper-dim)" }}>
          Date de sortie — vide pour un brouillon
        </label>
        <DatePicker value={publishDate} onChange={setPublishDate} />
        <p className="text-xs mt-2" style={{ color: "var(--text-on-paper-dim)" }}>
          {publishDate
            ? "À cette date, le livre passera tout seul de « Programmé » à « Publié »."
            : "Sans date, le livre reste en brouillon : personne ne le voit encore."}
        </p>
      </div>

      {error && (
        <p className="text-sm" style={{ color: "var(--wine)" }}>
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm" style={{ color: "var(--text-on-paper)" }}>
          ✓ {success}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="px-5 py-2.5 text-sm disabled:opacity-50"
        style={{ background: "var(--ink)", color: "var(--text-on-ink)", borderRadius: 3 }}
      >
        {submitting ? "Écriture..." : "Inscrire au catalogue"}
      </button>
    </form>
  );
}
