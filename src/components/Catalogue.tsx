"use client";

import { useState } from "react";
import type { Book, BookStatus } from "@/lib/types";

const statusLabel: Record<BookStatus, string> = {
  draft: "Brouillon",
  scheduled: "Programmé",
  published: "Publié",
};

const statusBorder: Record<BookStatus, string> = {
  draft: "var(--paper-line)",
  scheduled: "var(--gold)",
  published: "var(--wine)",
};

const statusText: Record<BookStatus, string> = {
  draft: "var(--text-on-paper-dim)",
  scheduled: "var(--gold)",
  published: "var(--wine)",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export function Catalogue({
  books,
  onDeleted,
  onEdit,
}: {
  books: Book[];
  onDeleted: () => void;
  onEdit: (book: Book) => void;
}) {
  const [publishing, setPublishing] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<{ id: string; message: string } | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Retirer « ${title} » du catalogue ?`)) return;
    await fetch(`/api/books/${id}`, { method: "DELETE" });
    onDeleted();
  }

  async function handlePublishNow(id: string) {
    setPublishing(id);
    setPublishError(null);
    try {
      const res = await fetch(`/api/books/${id}/publish-now`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Échec de l'envoi vers Shopify");
      }
      onDeleted();
    } catch (err) {
      setPublishError({ id, message: err instanceof Error ? err.message : "Erreur inconnue" });
    } finally {
      setPublishing(null);
    }
  }

  const legend: { status: BookStatus; help: string }[] = [
    { status: "draft", help: "pas de date de sortie — pour l'instant seulement toi le vois" },
    { status: "scheduled", help: "une date est fixée — passera en « Publié » ce jour-là, automatiquement" },
    { status: "published", help: "la date est arrivée — la mise en ligne réelle sur les boutiques viendra ensuite" },
  ];

  if (books.length === 0) {
    return (
      <div>
        <StatusLegend legend={legend} />
        <p className="text-sm mt-4" style={{ color: "var(--text-on-paper-dim)" }}>
          Le catalogue est vide. Le premier livre que tu inscris apparaîtra ici.
        </p>
      </div>
    );
  }

  return (
    <div>
      <StatusLegend legend={legend} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {books.map((book) => (
        <article
          key={book.id}
          className="group relative p-5 flex flex-col gap-2"
          style={{
            background: "var(--paper-dim)",
            borderLeft: `3px solid ${statusBorder[book.status]}`,
            borderRadius: 3,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              {book.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.coverUrl}
                  alt={`Couverture de ${book.title}`}
                  className="w-10 h-14 object-cover shrink-0"
                  style={{ borderRadius: 2, boxShadow: "0 4px 10px -4px var(--shadow-ink)" }}
                />
              ) : null}
              <h3 className="font-display text-lg leading-tight" style={{ color: "var(--text-on-paper)" }}>
                {book.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onEdit(book)}
                aria-label={`Modifier ${book.title}`}
                className="btn-chip text-xs px-2.5 py-1"
                style={{
                  border: "1px solid var(--paper-line)",
                  borderRadius: 3,
                  color: "var(--text-on-paper-dim)",
                }}
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={() => handleDelete(book.id, book.title)}
                aria-label={`Retirer ${book.title}`}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1"
                style={{ color: "var(--wine)" }}
              >
                ✕
              </button>
            </div>
          </div>

          <p className="text-sm" style={{ color: "var(--text-on-paper-dim)" }}>
            {book.series
              ? `${book.series.name}${book.orderInSeries ? ` · tome ${book.orderInSeries}` : ""}`
              : "Livre indépendant"}
          </p>

          <div className="flex items-center justify-between mt-2 text-sm">
            <span style={{ color: "var(--text-on-paper)" }}>{book.price} €</span>
            <span style={{ color: statusText[book.status] }}>{statusLabel[book.status]}</span>
          </div>

          {book.publishDate && (
            <p className="text-xs" style={{ color: "var(--text-on-paper-dim)" }}>
              Sortie le {formatDate(book.publishDate)}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePublishNow(book.id)}
              disabled={publishing === book.id}
              className="text-xs underline underline-offset-4 disabled:opacity-50"
              style={{ color: "var(--wine)" }}
            >
              {publishing === book.id
                ? "Envoi en cours..."
                : book.shopifyProductId
                ? "Mettre à jour sur Shopify"
                : "Publier sur Shopify maintenant"}
            </button>
            {book.shopifyProductId && (
              <span className="text-xs" style={{ color: "var(--text-on-paper-dim)" }}>
                ✓ synchronisé
              </span>
            )}
          </div>
          {publishError?.id === book.id && (
            <p className="text-xs" style={{ color: "var(--wine)" }}>
              {publishError.message}
            </p>
          )}
        </article>
      ))}
      </div>
    </div>
  );
}

function StatusLegend({ legend }: { legend: { status: BookStatus; help: string }[] }) {
  return (
    <div
      className="flex flex-col gap-1.5 p-4 text-sm"
      style={{ background: "var(--paper-dim)", borderRadius: 3 }}
    >
      {legend.map(({ status, help }) => (
        <p key={status} className="flex flex-wrap items-baseline gap-1.5">
          <span style={{ color: statusText[status], fontWeight: 600 }}>{statusLabel[status]}</span>
          <span style={{ color: "var(--text-on-paper-dim)" }}>— {help}</span>
        </p>
      ))}
    </div>
  );
}
