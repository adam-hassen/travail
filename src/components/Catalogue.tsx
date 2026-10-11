"use client";

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
}: {
  books: Book[];
  onDeleted: () => void;
}) {
  async function handleDelete(id: string, title: string) {
    if (!confirm(`Retirer « ${title} » du catalogue ?`)) return;
    await fetch(`/api/books/${id}`, { method: "DELETE" });
    onDeleted();
  }

  if (books.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-on-paper-dim)" }}>
        Le catalogue est vide. Le premier livre que tu inscris apparaîtra ici.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {books.map((book) => (
        <article
          key={book.id}
          className="group relative p-5 flex flex-col gap-2"
          style={{
            background: "var(--paper-dim)",
            borderLeft: `3px solid ${statusBorder[book.status]}`,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg leading-tight" style={{ color: "var(--text-on-paper)" }}>
              {book.title}
            </h3>
            <button
              onClick={() => handleDelete(book.id, book.title)}
              aria-label={`Retirer ${book.title}`}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs shrink-0"
              style={{ color: "var(--wine)" }}
            >
              ✕
            </button>
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
        </article>
      ))}
    </div>
  );
}
