"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ToastProvider } from "@/components/ui/Toast";

const FeedbackWidget = lazy(() => import("@/components/FeedbackWidget").then(m => ({ default: m.FeedbackWidget })));
const OnboardingModal = lazy(() => import("@/components/OnboardingModal"));

function PageTransition({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  return (
    <div className={mounted ? "page-enter" : ""}>
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
        <Suspense fallback={null}><OnboardingModal /></Suspense>
        <div className="h-dvh bg-paper flex overflow-hidden">
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
      <Suspense fallback={null}><FeedbackWidget /></Suspense>
    </ToastProvider>
    </AuthGuard>
  );
}
