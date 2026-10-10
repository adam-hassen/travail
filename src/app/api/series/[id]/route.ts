import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { series } from "@/db/schema";

const updateSeriesSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const found = await db.query.series.findFirst({
    where: eq(series.id, id),
    with: { books: true },
  });

  if (!found) {
    return NextResponse.json({ error: "Série introuvable" }, { status: 404 });
  }
  return NextResponse.json(found);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateSeriesSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(series)
    .set(parsed.data)
    .where(eq(series.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Série introuvable" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const [deleted] = await db
    .delete(series)
    .where(eq(series.id, id))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Série introuvable" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
