export function TicketCardSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-6 w-20 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-6 w-24 animate-pulse rounded bg-muted" />
    </div>
  );
}
