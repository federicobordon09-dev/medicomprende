export const dynamic = "force-dynamic";

import AuthClientLayout from "./AuthClientLayout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthClientLayout>{children}</AuthClientLayout>;
}
