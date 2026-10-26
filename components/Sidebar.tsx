"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardCheck,
  FileSearch,
  ListChecks,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

const navigation = [
  {
    href: "/single-screen",
    label: "Single screening",
    description: "Screen one subject",
    icon: FileSearch,
    adminOnly: false,
  },
  {
    href: "/batch-screen",
    label: "Batch screening",
    description: "Screen multiple subjects",
    icon: ListChecks,
    adminOnly: false,
  },
  {
    href: "/evaluate",
    label: "Evaluate results",
    description: "Measure screening quality",
    icon: ClipboardCheck,
    adminOnly: true,
  },
];

export default function Sidebar() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const visibleNavigation = navigation.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });
    if (response.ok) {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <aside className="border-b border-slate-200 bg-white/90 px-4 py-5 shadow-sm backdrop-blur lg:min-h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
      <div className="lg:sticky lg:top-8 h-full flex-col lg:flex">
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
          {visibleNavigation.map(({ href, label, description, icon: Icon }) => {
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

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:mt-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white">
              {user.name?.charAt(0).toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {user.name}
              </p>
              <p className="truncate text-sm capitalize text-slate-500">
                {user.role}
              </p>
            </div>
            <button
              onClick={() => handleLogout()}
              aria-label="Sign out"
              className="rounded-lg p-2 text-slate-500 transition-colors duration-200 hover:bg-slate-200 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
