export type Series = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  books?: Book[];
};

export type BookStatus = "draft" | "scheduled" | "published";

export type Book = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: string;
  coverUrl: string | null;
  seriesId: string | null;
  orderInSeries: number | null;
  publishDate: string | null;
  status: BookStatus;
  shopifyProductId: string | null;
  createdAt: string;
  updatedAt: string;
  series?: Series | null;
};
