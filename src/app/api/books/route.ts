import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { books } from "@/db/schema";
import { slugify } from "@/lib/slugify";

const createBookSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  price: z.number().positive("Le prix doit être positif"),
  // Soit une URL classique, soit une image envoyée depuis le formulaire
  // (encodée en data URL — pas besoin d'un service de stockage externe).
  coverUrl: z.string().max(3_000_000).optional().or(z.literal("")),
  seriesId: z.string().uuid().optional().nullable(),
  orderInSeries: z.number().int().positive().optional().nullable(),
  publishDate: z.string().datetime().optional().nullable(), // ISO string
});

export async function GET() {
  const allBooks = await db.query.books.findMany({
    orderBy: desc(books.createdAt),
    with: { series: true },
  });
  return NextResponse.json(allBooks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createBookSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, description, price, coverUrl, seriesId, orderInSeries, publishDate } =
    parsed.data;

  // Statut déduit automatiquement : pas de date = brouillon, date = programmé.
  // Le passage à "published" se fera plus tard par le scheduler, pas ici.
  const status = publishDate ? "scheduled" : "draft";

  const [created] = await db
    .insert(books)
    .values({
      title,
      slug: slugify(title),
      description,
      price: price.toFixed(2),
      coverUrl: coverUrl || null,
      seriesId: seriesId || null,
      orderInSeries: orderInSeries ?? null,
      publishDate: publishDate ? new Date(publishDate) : null,
      status,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
