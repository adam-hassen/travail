"use client";

import { useCallback, useEffect, useState } from "react";
import type { Book, Series } from "@/lib/types";
import { SeriesForm } from "./SeriesForm";
import { SeriesList } from "./SeriesList";
import { BookForm } from "./BookForm";
import { BooksTable } from "./BooksTable";

export function BackOffice() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [seriesRes, booksRes] = await Promise.all([
      fetch("/api/series"),
      fetch("/api/books"),
    ]);
    setSeriesList(await seriesRes.json());
    setBooks(await booksRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return <p className="p-6 text-sm text-neutral-500">Chargement...</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 p-6">
      <header>
        <h1 className="text-xl font-semibold text-neutral-900">Back-office — Livres</h1>
        <p className="text-sm text-neutral-500">
          Saisis tes livres et tes séries ici. La publication Shopify et réseaux sociaux
          sera branchée une fois les accès API récupérés.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-900">Séries</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SeriesForm onCreated={refresh} />
          <SeriesList seriesList={seriesList} onDeleted={refresh} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-900">Livres</h2>
        <BookForm seriesList={seriesList} onCreated={refresh} />
        <BooksTable books={books} onDeleted={refresh} />
      </section>
    </div>
  );
}
