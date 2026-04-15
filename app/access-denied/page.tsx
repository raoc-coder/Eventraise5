import Link from 'next/link'

export default function AccessDeniedPage({
  searchParams,
}: {
  searchParams?: { scope?: string }
}) {
  const isAdminScope = searchParams?.scope === 'admin'

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center justify-center px-4 py-16">
      <section className="w-full rounded-lg border bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Access denied</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
          You do not have permission to access this area. If you believe this is an error, contact the account owner.
        </p>
        {isAdminScope && (
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Your account is not authorized for the admin console.
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Back to home
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium text-gray-700"
          >
            Sign in with another account
          </Link>
        </div>
      </section>
    </main>
  )
}
