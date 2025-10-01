"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type SidebarProps = {
  children: React.ReactNode;
  className?: string;
};

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-60 shrink-0 border-r border-border/50 bg-background text-foreground",
        className
      )}
    >
      {children}
    </aside>
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
};

export function NavItem({ href, children }: NavItemProps) {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const active = pathname === href;
  return (
    <Link
      href={href}
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
  // helper to offset page content
  return <div className="w-60 shrink-0" />;
}
