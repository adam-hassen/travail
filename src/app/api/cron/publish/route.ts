import { NextRequest, NextResponse } from "next/server";
import { and, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { books } from "@/db/schema";

// Job quotidien (Vercel Cron) : fait passer en "published" tout livre
// "scheduled" dont la date de sortie est arrivée. Idempotent — peut être
// rejoué sans risque si Vercel déclenche deux fois ou qu'une exécution
// est manquée.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();

  const published = await db
    .update(books)
    .set({ status: "published", updatedAt: now })
    .where(and(eq(books.status, "scheduled"), lte(books.publishDate, now)))
    .returning({ id: books.id, title: books.title });

  return NextResponse.json({
    ranAt: now.toISOString(),
    publishedCount: published.length,
    published,
  });
}
