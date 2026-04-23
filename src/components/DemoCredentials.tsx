'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const demoAccounts = [
  { role: 'Governor', id: 'GOV001', password: 'pass123' },
  { role: 'Manager A', id: 'MGR001', password: 'pass123' },
  { role: 'Manager B', id: 'MGR002', password: 'pass123' },
  { role: 'Technician', id: 'TECH001', password: 'pass123' },
  { role: 'Citizen', id: 'Register yourself', password: '—' },
];

export default function DemoCredentials() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4 w-full max-w-md mx-auto">
      <CollapsibleTrigger className="flex items-center justify-center gap-2 w-full text-sm text-slate-400 hover:text-slate-300 transition-colors py-2">
        <span>Demo Credentials</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 rounded-lg border border-[#334155] bg-[#1e293b]/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="px-4 py-2 text-left text-slate-400 font-medium">Role</th>
                <th className="px-4 py-2 text-left text-slate-400 font-medium">ID</th>
                <th className="px-4 py-2 text-left text-slate-400 font-medium">Password</th>
              </tr>
            </thead>
            <tbody>
              {demoAccounts.map((account) => (
                <tr key={account.id} className="border-b border-[#334155]/50 last:border-0">
                  <td className="px-4 py-2 text-slate-300">{account.role}</td>
                  <td className="px-4 py-2 text-[#3b82f6] font-mono text-xs">{account.id}</td>
                  <td className="px-4 py-2 text-slate-400 font-mono text-xs">{account.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
