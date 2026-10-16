import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { books } from "@/db/schema";
import { pushBookToShopify, shopifyConfigured } from "@/lib/shopify";

type Params = { params: Promise<{ id: string }> };

// Publie un livre immédiatement (sans attendre sa date programmée ni le
// passage du cron quotidien) — utile pour tester la connexion Shopify.
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  const book = await db.query.books.findFirst({ where: eq(books.id, id) });
  if (!book) {
    return NextResponse.json({ error: "Livre introuvable" }, { status: 404 });
  }

  if (!shopifyConfigured()) {
    return NextResponse.json(
      { error: "Shopify n'est pas encore configuré (variables d'environnement manquantes)" },
      { status: 400 }
    );
  }

  try {
    const shopifyProductId = await pushBookToShopify(book);
    const [updated] = await db
      .update(books)
      .set({
        status: "published",
        publishDate: book.publishDate ?? new Date(),
        shopifyProductId,
        updatedAt: new Date(),
      })
      .where(eq(books.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue lors de l'envoi à Shopify" },
      { status: 502 }
    );
  }
}
