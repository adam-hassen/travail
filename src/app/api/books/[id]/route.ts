import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { books } from "@/db/schema";
import { slugify } from "@/lib/slugify";

const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  seriesId: z.string().uuid().optional().nullable(),
  orderInSeries: z.number().int().positive().optional().nullable(),
  publishDate: z.string().datetime().optional().nullable(),
  status: z.enum(["draft", "scheduled", "published"]).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const found = await db.query.books.findFirst({
    where: eq(books.id, id),
    with: { series: true },
  });

  if (!found) {
    return NextResponse.json({ error: "Livre introuvable" }, { status: 404 });
  }
  return NextResponse.json(found);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateBookSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, price, coverUrl, publishDate, ...rest } = parsed.data;

  const [updated] = await db
    .update(books)
    .set({
      ...rest,
      ...(title ? { title, slug: slugify(title) } : {}),
      ...(price !== undefined ? { price: price.toFixed(2) } : {}),
      ...(coverUrl !== undefined ? { coverUrl: coverUrl || null } : {}),
      ...(publishDate !== undefined
        ? { publishDate: publishDate ? new Date(publishDate) : null }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(books.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Livre introuvable" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const [deleted] = await db.delete(books).where(eq(books.id, id)).returning();

  if (!deleted) {
    return NextResponse.json({ error: "Livre introuvable" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
