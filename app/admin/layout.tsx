import { ReactNode } from "react";

/** Root admin segment — login is public; protected routes use `(console)/layout`. */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
