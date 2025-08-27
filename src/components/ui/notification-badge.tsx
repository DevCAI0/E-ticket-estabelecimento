// components/ui/notification-badge.tsx
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  show?: boolean;
  className?: string;
  maxCount?: number;
  showDot?: boolean;
}

export function NotificationBadge({
  count,
  show = true,
  className,
  maxCount = 99,
  showDot = false,
}: NotificationBadgeProps) {
  if (!show || count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  const shouldShowDot = showDot && count > 0;

  return (
    <div
      className={cn(
        "absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-red-500 text-white",
        shouldShowDot
          ? "h-2 w-2"
          : "min-h-[18px] min-w-[18px] px-1 text-xs font-medium",
        className,
      )}
    >
      {!shouldShowDot && displayCount}
    </div>
  );
}
