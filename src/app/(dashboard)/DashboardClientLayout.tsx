"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ToastProvider } from "@/components/ui/Toast";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { OnboardingModal } from "@/components/OnboardingModal";

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-enter">
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
    <AuthGuard>
      <ToastProvider>
        <OnboardingModal />
        <div className="h-dvh bg-azul-50 flex overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <DashboardHeader />
            <main className="flex-1 overflow-auto p-4 pl-14 lg:pl-6">
              <PageTransition>
                {children}
              </PageTransition>
          </main>
        </div>
      </div>
      <FeedbackWidget />
    </ToastProvider>
    </AuthGuard>
  );
}
