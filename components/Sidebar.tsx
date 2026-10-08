"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSearch, ListChecks, ShieldAlert } from "lucide-react";

const navigation = [
  {
    href: "/",
    label: "Single screening",
    description: "Screen one subject",
    icon: FileSearch,
  },
  {
    href: "/batch-screen",
    label: "Batch screening",
    description: "Screen a CSV file",
    icon: ListChecks,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-slate-200 bg-white/90 px-4 py-5 shadow-sm backdrop-blur lg:min-h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
      <div className="lg:sticky lg:top-8">
        <div className="flex items-center gap-2 text-indigo-600">
          <ShieldAlert className="h-5 w-5" />
          <span className="text-sm font-bold tracking-wide">
            COMPLIANCE WORKSPACE
          </span>
        </div>

        <nav
          aria-label="Primary navigation"
          className="mt-5 flex gap-2 overflow-x-auto lg:flex-col"
        >
          {navigation.map(({ href, label, description, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`flex min-w-fit items-center gap-3 rounded-xl px-3 py-3 transition lg:min-w-0 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="hidden text-xs text-slate-500 lg:block">
                    {description}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
