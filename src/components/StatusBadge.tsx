import type { BookStatus } from "@/lib/types";

const labels: Record<BookStatus, string> = {
  draft: "Brouillon",
  scheduled: "Programmé",
  published: "Publié",
};

const styles: Record<BookStatus, string> = {
  draft: "bg-neutral-100 text-neutral-700",
  scheduled: "bg-amber-100 text-amber-800",
  published: "bg-green-100 text-green-800",
};

export function StatusBadge({ status }: { status: BookStatus }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
