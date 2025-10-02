"use client";

import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  NavItem,
  NavSection,
} from "@/components/ui/sidebar";

export default function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile hamburger menu - floating button on mobile, hidden when sidebar is open */}
      {!isOpen && (
        <div className="fixed top-3 left-3 z-40 md:hidden">
          <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-1 shadow-lg">
            <SidebarTrigger onClick={() => setIsOpen(true)} />
          </div>
        </div>
      )}

      {/* Sidebar - always render, responsive behavior handled in component */}
      <Sidebar isOpen={isOpen} onClose={closeSidebar}>
        <SidebarHeader>Workout Tracker</SidebarHeader>
        <SidebarContent>
          <NavSection title="">
            <NavItem href="/" onClick={closeSidebar}>
              Home
            </NavItem>
            <NavItem href="/sessions/log" onClick={closeSidebar}>
              Log Session
            </NavItem>
            <NavItem href="/sessions" onClick={closeSidebar}>
              View Sessions
            </NavItem>
          </NavSection>
        </SidebarContent>
        <SidebarFooter>v1.0</SidebarFooter>
      </Sidebar>
    </>
  );
}
