"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
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
  const { data: session } = useSession();

  const closeSidebar = () => setIsOpen(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
    closeSidebar();
  };

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
          <NavSection title="">
            {session ? (
              <div className="px-3 py-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-2"
                  onClick={handleSignOut}
                >
                  Sign Out ({session.user?.name})
                </Button>
              </div>
            ) : (
              <NavItem href="/login" onClick={closeSidebar}>
                Sign In
              </NavItem>
            )}
          </NavSection>
        </SidebarContent>
        <SidebarFooter>v1.0</SidebarFooter>
      </Sidebar>
    </>
  );
}
