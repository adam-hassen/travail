"use client";

import type { Book } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function BooksTable({
  books,
  onDeleted,
}: {
  books: Book[];
  onDeleted: () => void;
}) {
  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce livre ?")) return;
    await fetch(`/api/books/${id}`, { method: "DELETE" });
    onDeleted();
  }

  if (books.length === 0) {
    return <p className="text-sm text-neutral-500">Aucun livre pour l'instant.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="min-w-full divide-y divide-neutral-200 text-sm">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-neutral-600">Titre</th>
            <th className="px-3 py-2 text-left font-medium text-neutral-600">Série</th>
            <th className="px-3 py-2 text-left font-medium text-neutral-600">Prix</th>
            <th className="px-3 py-2 text-left font-medium text-neutral-600">Sortie</th>
            <th className="px-3 py-2 text-left font-medium text-neutral-600">Statut</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {books.map((book) => (
            <tr key={book.id}>
              <td className="px-3 py-2 text-neutral-900">{book.title}</td>
              <td className="px-3 py-2 text-neutral-600">
                {book.series ? (
                  <>
                    {book.series.name}
                    {book.orderInSeries ? ` (tome ${book.orderInSeries})` : ""}
                  </>
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </td>
              <td className="px-3 py-2 text-neutral-600">{book.price} €</td>
              <td className="px-3 py-2 text-neutral-600">
                {book.publishDate
                  ? new Date(book.publishDate).toLocaleString("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={book.status} />
              </td>
              <td className="px-3 py-2 text-right">
                <button
                  onClick={() => handleDelete(book.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
