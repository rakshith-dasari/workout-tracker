"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  NavItem,
  NavSection,
} from "@/components/ui/sidebar";

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>Workout Tracker</SidebarHeader>
      <SidebarContent>
        <NavSection title="">
          <NavItem href="/">Home</NavItem>
          <NavItem href="/sessions/log">Log Session</NavItem>
          <NavItem href="/sessions">View Sessions</NavItem>
        </NavSection>
      </SidebarContent>
      <SidebarFooter>v1.0</SidebarFooter>
    </Sidebar>
  );
}
