export function TicketCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-40 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-6 w-20 bg-muted animate-pulse rounded" />
      </div>
      <div className="h-6 w-24 bg-muted animate-pulse rounded" />
    </div>
  );
}