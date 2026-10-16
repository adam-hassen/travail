import { NextRequest, NextResponse } from "next/server";
import { and, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { books } from "@/db/schema";
import { pushBookToShopify, shopifyConfigured } from "@/lib/shopify";

// Job quotidien (Vercel Cron) : fait passer en "published" tout livre
// "scheduled" dont la date de sortie est arrivée, et l'envoie sur Shopify
// si les identifiants sont configurés. Idempotent — peut être rejoué sans
// risque si Vercel déclenche deux fois ou qu'une exécution est manquée.
export async function GET(req: NextRequest) {
  // Vercel appelle cette route avec l'en-tête Authorization. Pour un test
  // manuel depuis le navigateur (sans pouvoir fixer d'en-tête), on accepte
  // aussi le même secret en paramètre d'URL ?key=...
  const authHeader = req.headers.get("authorization");
  const keyParam = req.nextUrl.searchParams.get("key");
  const authorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` || keyParam === process.env.CRON_SECRET;

  if (!authorized) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();

  const toPublish = await db
    .update(books)
    .set({ status: "published", updatedAt: now })
    .where(and(eq(books.status, "scheduled"), lte(books.publishDate, now)))
    .returning();

  const results: { id: string; title: string; shopify: "ok" | "skipped" | "error"; detail?: string }[] = [];

  for (const book of toPublish) {
    if (!shopifyConfigured()) {
      results.push({ id: book.id, title: book.title, shopify: "skipped" });
      continue;
    }
    try {
      const shopifyProductId = await pushBookToShopify(book);
      await db
        .update(books)
        .set({ shopifyProductId, updatedAt: new Date() })
        .where(eq(books.id, book.id));
      results.push({ id: book.id, title: book.title, shopify: "ok" });
    } catch (err) {
      // Le livre reste "published" côté registre même si l'envoi Shopify
      // échoue — on ne bloque pas tout le job pour un seul livre en erreur.
      results.push({
        id: book.id,
        title: book.title,
        shopify: "error",
        detail: err instanceof Error ? err.message : "Erreur inconnue",
      });
    }
  }

  return NextResponse.json({
    ranAt: now.toISOString(),
    publishedCount: toPublish.length,
    results,
  });
}
