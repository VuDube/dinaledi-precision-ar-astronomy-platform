import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  const isMobile = useIsMobile();
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      {!isMobile && <AppSidebar />}
      <SidebarInset className={className}>
        <div className={isMobile ? "pb-24" : ""}>
          {container ? (
            <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12" + (contentClassName ? ` ${contentClassName}` : "")}>
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}