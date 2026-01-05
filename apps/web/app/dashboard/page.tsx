'use client';

import { useEffect, useState } from 'react';

interface Tenant {
  id: string;
  name: string;
  legalName: string;
  timezone: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
}

export default function DashboardPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const tenantRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/me`, {
        credentials: 'include'
      });
      if (!tenantRes.ok) {
        setError('Not authenticated');
        return;
      }
      const tenantData = (await tenantRes.json()) as Tenant;
      setTenant(tenantData);

      const customersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers`, {
        credentials: 'include'
      });
      if (customersRes.ok) {
        setCustomers((await customersRes.json()) as Customer[]);
      }
    };
    void load();
  }, []);

  if (error) {
    return (
      <main className="min-h-screen px-8 py-16">
        <p className="text-red-400">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-8 py-16">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        {tenant && (
          <div className="rounded border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">{tenant.name}</h2>
            <p className="text-sm text-slate-400">{tenant.legalName}</p>
            <p className="text-sm text-slate-400">Timezone: {tenant.timezone}</p>
          </div>
        )}
        <div className="rounded border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Customers</h2>
          <ul className="mt-4 space-y-2">
            {customers.map((customer) => (
              <li key={customer.id} className="rounded border border-slate-800 px-3 py-2">
                <div className="font-medium">{customer.name}</div>
                {customer.email && <div className="text-sm text-slate-400">{customer.email}</div>}
              </li>
            ))}
            {customers.length === 0 && (
              <li className="text-sm text-slate-400">No customers yet.</li>
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
