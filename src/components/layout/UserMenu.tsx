"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, LogOut, UserCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type UserMenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type UserMenuProps = {
  displayName?: string | null;
  roleLabel: string;
  items: UserMenuItem[];
  avatarUrl?: string | null;
  onLogout: () => void;
};

export default function UserMenu({
  displayName,
  roleLabel,
  items,
  avatarUrl,
  onLogout,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full p-1 pr-2 text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label="Mở menu tài khoản"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-primary/10 text-primary shadow-sm">
          {avatarUrl ? (
            // Profile images can come from user-configured external storage domains.
            // eslint-disable-next-line @next/next/no-img-element
            <img className="h-full w-full object-cover" src={avatarUrl} alt="Ảnh đại diện" />
          ) : (
            <UserCircle className="h-7 w-7" />
          )}
        </span>
        <ChevronDown className={`hidden h-4 w-4 transition-transform sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+0.75rem)] z-[70] w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
          role="menu"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-bold text-slate-800">
              {displayName?.trim() || roleLabel}
            </p>
            {displayName?.trim() && (
              <p className="mt-1 text-xs font-medium text-slate-400">{roleLabel}</p>
            )}
          </div>

          <div className="p-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              role="menuitem"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
