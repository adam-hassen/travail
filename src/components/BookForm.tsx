"use client";

import { useRef, useState } from "react";
import type { Book, BookStatus, Series } from "@/lib/types";
import { DatePicker } from "./DatePicker";
import { fileToCoverDataUrl } from "@/lib/image";

const statusOptions: { value: BookStatus; label: string }[] = [
  { value: "draft", label: "Brouillon" },
  { value: "scheduled", label: "Programmé" },
  { value: "published", label: "Publié" },
];

export function BookForm({
  seriesList,
  onCreated,
  editingBook,
  onCancelEdit,
}: {
  seriesList: Series[];
  onCreated: () => void;
  editingBook?: Book | null;
  onCancelEdit?: () => void;
}) {
  const isEditing = Boolean(editingBook);

  // Le parent remonte ce formulaire (via une prop `key` liée à l'id du livre
  // édité) à chaque passage brouillon ↔ édition, donc ces valeurs initiales
  // n'ont besoin d'être lues qu'une fois par montage — pas de useEffect de
  // synchronisation nécessaire.
  const [title, setTitle] = useState(editingBook?.title ?? "");
  const [description, setDescription] = useState(editingBook?.description ?? "");
  const [price, setPrice] = useState(editingBook?.price ?? "");
  const [coverUrl, setCoverUrl] = useState(editingBook?.coverUrl ?? "");
  const [seriesId, setSeriesId] = useState(editingBook?.seriesId ?? "");
  const [orderInSeries, setOrderInSeries] = useState(
    editingBook?.orderInSeries ? String(editingBook.orderInSeries) : ""
  );
  const [publishDate, setPublishDate] = useState<Date | null>(
    editingBook?.publishDate ? new Date(editingBook.publishDate) : null
  );
  const [status, setStatus] = useState<BookStatus>(editingBook?.status ?? "draft");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTitle("");
    setDescription("");
    setPrice("");
    setCoverUrl("");
    setSeriesId("");
    setOrderInSeries("");
    setPublishDate(null);
    setStatus("draft");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function loadPhoto(file: File | undefined) {
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

  function handlePhotoInput(e: React.ChangeEvent<HTMLInputElement>) {
    loadPhoto(e.target.files?.[0]);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    loadPhoto(e.dataTransfer.files?.[0]);
  }

  function removePhoto(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
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
      const body: Record<string, unknown> = {
        title,
        description: description || undefined,
        price: priceNum,
        // En édition on envoie toujours la couverture (même vide) pour
        // pouvoir la retirer ; à la création, "undefined" = pas de photo.
        coverUrl: isEditing ? coverUrl : coverUrl || undefined,
        seriesId: seriesId || undefined,
        orderInSeries: orderInSeries ? parseInt(orderInSeries, 10) : undefined,
        publishDate: publishDate ? publishDate.toISOString() : undefined,
      };
      if (isEditing) {
        body.status = status;
        // En édition, une date effacée doit bien effacer la programmation.
        if (!publishDate) body.publishDate = null;
        if (!seriesId) body.seriesId = null;
        if (!orderInSeries) body.orderInSeries = null;
      }

      const res = await fetch(
        isEditing ? `/api/books/${editingBook!.id}` : "/api/books",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.formErrors?.[0] ?? "Erreur à l'enregistrement");
      }

      const savedTitle = title;
      onCreated();

      if (isEditing) {
        onCancelEdit?.();
      } else {
        reset();
        setSuccess(
          publishDate
            ? `« ${savedTitle} » est inscrit et programmé. Il passera en « Publié » automatiquement à la date prévue.`
            : `« ${savedTitle} » est inscrit comme brouillon. Ajoute une date de sortie quand tu seras prête à le programmer.`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8"
      style={{ background: "var(--paper-dim)", borderLeft: "3px solid var(--gold)", borderRadius: 3 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-6 sm:gap-8">
        {/* la couverture : pas un champ de formulaire, un véritable emplacement de livre */}
        <div className="w-32 sm:w-full mx-auto sm:mx-0">
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`cover-slot${dragOver ? " is-dragover" : ""}`}
            style={{ boxShadow: coverUrl ? `0 10px 24px -8px ${"var(--shadow-ink)"}` : undefined }}
            aria-label={coverUrl ? "Changer la photo de couverture" : "Ajouter une photo de couverture"}
          >
            {coverUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img key={coverUrl} src={coverUrl} alt="Aperçu de la couverture" className="cover-slot__image" />
                <span className="cover-slot__spine" aria-hidden="true" />
                <button
                  type="button"
                  onClick={removePhoto}
                  aria-label="Retirer la photo"
                  className="cover-slot__remove text-xs"
                >
                  ✕
                </button>
              </>
            ) : (
              <div className="cover-slot__empty">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 19.5V5.5C4 4.4 4.9 3.5 6 3.5H15L20 8.5V19.5C20 20.6 19.1 21.5 18 21.5H6C4.9 21.5 4 20.6 4 19.5Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path d="M15 3.5V8.5H20" stroke="currentColor" strokeWidth="1.3" />
                  <circle cx="10.5" cy="13" r="1.6" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M7 18L10 14.8L12.2 16.8L14.5 13.8L17 17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-xs leading-snug">
                  {imageLoading ? "Chargement..." : <>Glisse une photo ici,<br />ou clique pour choisir</>}
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoInput}
            className="hidden"
          />
          <p className="text-xs mt-2 text-center sm:text-left" style={{ color: "var(--text-on-paper-dim)" }}>
            Couverture du livre
          </p>
        </div>

        <div className="space-y-5">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-on-paper-dim)" }}>
                Date de sortie
              </label>
              <DatePicker value={publishDate} onChange={setPublishDate} />
            </div>
          </div>
          <p className="text-xs -mt-3" style={{ color: "var(--text-on-paper-dim)" }}>
            {publishDate
              ? "À cette date, le livre passera tout seul de « Programmé » à « Publié »."
              : "Sans date, le livre reste en brouillon : personne ne le voit encore."}
          </p>

          {isEditing && (
            <div>
              <label className="block text-sm mb-1" style={{ color: "var(--text-on-paper-dim)" }}>
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BookStatus)}
                className="field w-full px-3 py-2 text-sm"
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <p className="text-xs mt-1" style={{ color: "var(--text-on-paper-dim)" }}>
                À changer manuellement seulement si besoin — sinon le statut se gère tout seul.
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm mt-5" style={{ color: "var(--wine)" }}>
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm mt-5" style={{ color: "var(--text-on-paper)" }}>
          ✓ {success}
        </p>
      )}

      <div className="flex items-center gap-4 mt-6">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 text-sm disabled:opacity-50"
          style={{ background: "var(--ink)", color: "var(--text-on-ink)", borderRadius: 3 }}
        >
          {submitting ? "Écriture..." : isEditing ? "Enregistrer les modifications" : "Inscrire au catalogue"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-sm underline underline-offset-4"
            style={{ color: "var(--text-on-paper-dim)" }}
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
