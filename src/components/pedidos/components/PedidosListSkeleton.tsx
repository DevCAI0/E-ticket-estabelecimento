export function PedidosListSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="mb-3 h-10 animate-pulse rounded-lg bg-muted" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-16 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>

      <div className="space-y-3 px-4 py-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="mb-3 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="flex justify-between">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 flex-1 animate-pulse rounded-lg bg-muted" />
              <div className="h-8 flex-1 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
