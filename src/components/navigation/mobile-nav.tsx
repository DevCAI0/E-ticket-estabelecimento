// src/components/navigation/mobile-nav.tsx
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavLinks } from "./nav-links";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-72 p-0">
        <ScrollArea className="h-full py-6">
          <div className="px-4 mb-6">
            <span className="font-semibold text-lg">Menu</span>
          </div>
          <NavLinks onItemClick={onClose} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

