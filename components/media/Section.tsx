import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "@/components/ui/icons";

interface Props {
  title: string;
  href?: string;
  children: ReactNode;
  id?: string;
}

export function Section({ title, href, children, id }: Props) {
  return (
    <section id={id} className="mt-7 animate-fade-in">
      <div className="mb-3 flex items-end justify-between px-4">
        <h2 className="text-[17px] font-bold tracking-tight">{title}</h2>
        {href ? (
          <Link href={href} className="flex items-center text-xs font-medium text-muted hover:text-fg">
            See all <ChevronRightIcon size={14} />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function HScroll({ children }: { children: ReactNode }) {
  return (
    <div className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1">
      {children}
    </div>
  );
}
