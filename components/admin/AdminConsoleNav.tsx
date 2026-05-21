import Link from "next/link";

const baseLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/payouts/events", label: "Event Payouts" },
  { href: "/admin/payouts", label: "Donation Payouts" },
];

type Props = {
  isSuperAdmin?: boolean;
  adminEmail?: string | null;
};

export function AdminConsoleNav({ isSuperAdmin = false, adminEmail }: Props) {
  const links = isSuperAdmin
    ? [...baseLinks, { href: "/admin/admins", label: "Admins" }]
    : baseLinks;

  return (
    <div className="border-b bg-trust-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          <span className="mr-2 self-center text-xs font-semibold uppercase tracking-wide text-trust-200">
            Admin Console
          </span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center rounded-md border border-trust-700 px-3 py-1.5 text-sm font-medium text-trust-50 hover:bg-trust-800"
            >
              {link.label}
            </Link>
          ))}
        </div>
        {adminEmail && (
          <p className="text-xs text-trust-300 truncate max-w-xs" title={adminEmail}>
            {adminEmail}
          </p>
        )}
      </div>
    </div>
  );
}
