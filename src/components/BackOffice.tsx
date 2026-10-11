"use client";

import { useCallback, useEffect, useState } from "react";
import type { Book, Series } from "@/lib/types";
import { SeriesForm } from "./SeriesForm";
import { Shelf } from "./Shelf";
import { BookForm } from "./BookForm";
import { Catalogue } from "./Catalogue";

export function BackOffice() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSeriesForm, setShowSeriesForm] = useState(false);
  const [seriesNotice, setSeriesNotice] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      {/* la couverture */}
      <header
        className="px-6 py-10 sm:py-14"
        style={{ background: "var(--ink)", color: "var(--text-on-ink)" }}
      >
        <div className="mx-auto max-w-3xl">
          <p
            className="text-sm mb-2"
            style={{ color: "var(--gold-soft)" }}
          >
            Maison d&apos;édition indépendante
          </p>
          <h1 className="font-display text-4xl sm:text-5xl" style={{ fontWeight: 480 }}>
            L&apos;Atelier
          </h1>
          <p
            className="mt-3 max-w-md text-sm leading-relaxed"
            style={{ color: "var(--text-on-ink-dim)" }}
          >
            Le registre des livres : ce que tu écris, quand ça sort, et dans quel ordre
            ça se lit. La diffusion sur les boutiques et réseaux viendra s&apos;y brancher
            ensuite.
          </p>
          <div
            className="mt-6 max-w-md text-sm leading-relaxed p-4"
            style={{ background: "rgba(255,255,255,0.06)", borderLeft: "3px solid var(--gold)", borderRadius: 3, color: "var(--text-on-ink-dim)" }}
          >
            <p style={{ color: "var(--text-on-ink)" }} className="font-display text-base mb-1">
              Comment ça marche
            </p>
            <p>
              1. Tu crées une série si le livre fait partie d&apos;une saga.<br />
              2. Tu inscris le livre, avec ou sans date de sortie.<br />
              3. Sans date → il reste en brouillon, visible seulement par toi.<br />
              4. Avec une date → il devient « Publié » automatiquement ce jour-là.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-14">
        {loading ? (
          <p className="text-sm" style={{ color: "var(--text-on-paper-dim)" }}>
            Ouverture du registre...
          </p>
        ) : (
          <>
            <section>
              <Shelf
                seriesList={seriesList}
                onDeleted={refresh}
                onRequestNewSeries={() => setShowSeriesForm((v) => !v)}
              />
              {showSeriesForm && (
                <div className="mt-4">
                  <SeriesForm
                    onCreated={(name) => {
                      refresh();
                      setShowSeriesForm(false);
                      setSeriesNotice(`« ${name} » a été ajoutée à l'étagère.`);
                    }}
                  />
                </div>
              )}
              {seriesNotice && (
                <p className="text-sm mt-3" style={{ color: "var(--text-on-paper)" }}>
                  ✓ {seriesNotice}
                </p>
              )}
            </section>

            <section>
              <h2 className="font-display text-2xl mb-4" style={{ color: "var(--text-on-paper)" }}>
                Nouveau livre
              </h2>
              <BookForm seriesList={seriesList} onCreated={refresh} />
            </section>

            <section>
              <h2 className="font-display text-2xl mb-4" style={{ color: "var(--text-on-paper)" }}>
                Le catalogue
              </h2>
              <Catalogue books={books} onDeleted={refresh} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
