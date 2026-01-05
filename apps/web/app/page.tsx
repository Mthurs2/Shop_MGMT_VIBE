import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen px-8 py-16">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-4xl font-semibold">Shop Management SaaS</h1>
        <p className="text-lg text-slate-300">
          Manage tenants, repair orders, customers, and inventory with strict tenant isolation and audit trails.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-400"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="rounded border border-indigo-400 px-4 py-2 text-indigo-200 hover:bg-indigo-500/20"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
