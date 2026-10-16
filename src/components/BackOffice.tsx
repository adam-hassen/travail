"use client";

import { useCallback, useEffect, useState } from "react";
import type { Book, Series } from "@/lib/types";
import { SeriesForm } from "./SeriesForm";
import { Shelf } from "./Shelf";
import { BookForm } from "./BookForm";
import { Catalogue } from "./Catalogue";
import { Modal } from "./Modal";

export function BackOffice() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSeriesForm, setShowSeriesForm] = useState(false);
  const [seriesNotice, setSeriesNotice] = useState<string | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

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
        className="cloth-texture relative px-6 py-12 sm:py-16 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 600px 400px at 8% -10%, rgba(181,144,47,0.16), transparent 60%), var(--ink)",
          color: "var(--text-on-ink)",
          borderBottom: "1px solid var(--ink-line)",
          boxShadow: "0 1px 0 var(--ink), 0 4px 0 -2px var(--ink), 0 5px 0 -2px var(--ink-line)",
        }}
      >
        <a
          href="https://github.com/adam-hassen"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 absolute top-6 right-6 text-xs opacity-70 hover:opacity-100 transition-opacity"
          style={{ color: "var(--gold-soft)" }}
        >
          <Fleuron color="var(--gold-soft)" />
          <span>Atelier conçu par Adam Hassen</span>
        </a>

        <div className="mx-auto max-w-3xl relative reveal">
          <div className="flex items-center gap-3 mb-2">
            <Fleuron color="var(--gold-soft)" />
            <p className="text-sm" style={{ color: "var(--gold-soft)" }}>
              Maison d&apos;édition indépendante
            </p>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl" style={{ fontWeight: 480 }}>
            L&apos;Atelier
          </h1>
          <p
            className="mt-4 max-w-md text-sm leading-relaxed"
            style={{ color: "var(--text-on-ink-dim)" }}
          >
            Le registre des livres : ce que tu écris, quand ça sort, et dans quel ordre
            ça se lit. La diffusion sur les boutiques et réseaux viendra s&apos;y brancher
            ensuite.
          </p>
          <div
            className="mt-7 max-w-md text-sm leading-relaxed p-5"
            style={{
              background: "rgba(244,239,227,0.05)",
              border: "1px solid rgba(217,189,119,0.25)",
              borderRadius: 3,
              color: "var(--text-on-ink-dim)",
            }}
          >
            <p style={{ color: "var(--text-on-ink)" }} className="font-display text-base mb-2">
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

      <main className="paper-texture mx-auto max-w-3xl px-6 py-12 space-y-16">
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
              <SectionTitle>Nouveau livre</SectionTitle>
              <BookForm seriesList={seriesList} onCreated={refresh} />
            </section>

            <section>
              <SectionTitle>Le catalogue</SectionTitle>
              <Catalogue books={books} onDeleted={refresh} onEdit={setEditingBook} />
            </section>
          </>
        )}
      </main>

      {editingBook && (
        <Modal onClose={() => setEditingBook(null)} label={`Modifier ${editingBook.title}`}>
          <BookForm
            key={editingBook.id}
            seriesList={seriesList}
            onCreated={refresh}
            editingBook={editingBook}
            onCancelEdit={() => setEditingBook(null)}
          />
        </Modal>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span style={{ width: 22, height: 2, background: "var(--gold)" }} />
      <h2 className="font-display text-2xl" style={{ color: "var(--text-on-paper)" }}>
        {children}
      </h2>
    </div>
  );
}

function Fleuron({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1C8 1 10 4 10 6.5C10 8 9 8.8 8 8.8C7 8.8 6 8 6 6.5C6 4 8 1 8 1Z"
        stroke={color}
        strokeWidth="1"
      />
      <path d="M8 8.8V15" stroke={color} strokeWidth="1" />
      <path d="M8 11.5C8 11.5 5.5 11 4.5 12.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M8 11.5C8 11.5 10.5 11 11.5 12.5" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
