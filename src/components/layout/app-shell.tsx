"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LogOut, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MAIN_NAV, SETTINGS_NAV, APP_NAME } from "@/constants";
import { useAppData } from "@/components/providers/app-data-provider";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Responsive application chrome: a sticky header with the primary navigation on
 * desktop and a floating bottom tab bar on mobile.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile } = useAppData();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out. See you soon!");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Desktop / tablet header */}
      <header className="sticky top-0 z-40 hidden border-b border-border/60 bg-card/80 backdrop-blur-lg md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary shadow-soft">
              <Heart className="h-4 w-4 fill-white text-white" />
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">
              {APP_NAME}
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            <Link
              href={SETTINGS_NAV.href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                isActive(SETTINGS_NAV.href)
                  ? "bg-accent text-primary"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Settings className="h-4 w-4" />
              {SETTINGS_NAV.label}
            </Link>
            <button
              onClick={signOut}
              className="ml-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:px-6 md:pb-12">
        {children}
      </main>

      {/* Page content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:px-6 md:pb-12">
        {children}
      </main>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-card/80 px-4 py-3 backdrop-blur-lg md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-soft">
            <Heart className="h-4 w-4 fill-white text-white" />
          </span>
          <span className="text-base font-bold tracking-tight">{APP_NAME}</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/settings"
            className="rounded-full p-2 text-muted-foreground hover:bg-accent"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>
          <button
            onClick={signOut}
            className="rounded-full p-2 text-muted-foreground hover:bg-accent"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/90 backdrop-blur-lg md:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1.5">
          {MAIN_NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex min-w-14 flex-col items-center gap-1 rounded-xl px-3 py-1.5"
              >
                {active && (
                  <motion.span
                    layoutId="mobile-tab"
                    className="absolute inset-0 rounded-xl bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "relative z-10 h-5 w-5",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "relative z-10 text-[11px] font-medium",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      {/* Hidden profile name for accessibility tools */}
      <span className="sr-only">{profile?.full_name ?? ""}</span>
    </div>
  );
}
