import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { series } from "@/db/schema";
import { slugify } from "@/lib/slugify";
import { desc } from "drizzle-orm";

const createSeriesSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
});

export async function GET() {
  const allSeries = await db.query.series.findMany({
    orderBy: desc(series.createdAt),
    with: { books: true },
  });
  return NextResponse.json(allSeries);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSeriesSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, description } = parsed.data;
  const slug = slugify(name);

  const [created] = await db
    .insert(series)
    .values({ name, description, slug })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
