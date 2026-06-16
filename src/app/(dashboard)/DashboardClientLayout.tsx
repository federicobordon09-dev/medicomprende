"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ToastProvider } from "@/components/ui/Toast";
import { FeedbackWidget } from "@/components/FeedbackWidget";

function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthGuard>
        <ToastProvider>
          <div className="h-dvh bg-sk-50 flex overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <DashboardHeader />
              <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6">
                <PageTransition>
                  {children}
                </PageTransition>
            </main>
          </div>
        </div>
        <FeedbackWidget />
      </ToastProvider>
      </AuthGuard>
    </SessionProvider>
  );
}
