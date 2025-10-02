"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type SidebarProps = {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
};

export function Sidebar({
  children,
  className,
  isOpen = true,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-60 shrink-0 border-r border-border/50 bg-background text-foreground transition-transform duration-300 ease-in-out",
          // Hide on mobile by default, show when isOpen is true
          "transform -translate-x-full md:translate-x-0",
          isOpen && "translate-x-0",
          className
        )}
      >
        {children}
      </aside>
    </>
  );
}

export function SidebarHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-14 items-center px-4 text-sm font-semibold">
      {children}
    </div>
  );
}

export function SidebarFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-auto border-t p-3 text-xs text-muted-foreground">
      {children}
    </div>
  );
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100%-3.5rem)] flex-col overflow-y-auto">
      {children}
    </div>
  );
}

export function NavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-3 py-2">
      <div className="px-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground/80">
        {title}
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

type NavItemProps = {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
  onClick?: () => void;
};

export function NavItem({ href, children, onClick }: NavItemProps) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "px-2 py-1.5 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/30",
        active && "bg-muted text-foreground"
      )}
    >
      {children}
    </Link>
  );
}

export function SidebarSpacer() {
  // helper to offset page content - only show on desktop
  return <div className="hidden w-60 shrink-0 md:block" />;
}

type SidebarTriggerProps = {
  onClick: () => void;
  className?: string;
};

export function SidebarTrigger({ onClick, className }: SidebarTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden",
        className
      )}
      aria-label="Toggle sidebar"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}
