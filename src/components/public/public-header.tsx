"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, CalendarDays, ChevronDown, Menu, ShoppingCart, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mainNav = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Client portal", href: "/client-portal" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
] as const;

const resourceNav = [
  { label: "AI research", href: "/ai-research", description: "How we use AI" },
  { label: "Sign in", href: "/sign-in", description: "Access your secure account" },
] as const;

const consultationButtonClass = buttonClassName({
  className:
    "ifta-button-accent h-10 rounded-lg px-4 text-sm",
  size: "sm",
  variant: "accent",
});

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    return href === "/" ? pathname === href : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-[#071b30] text-white shadow-lg shadow-black/10">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link aria-label="IFTA Consulting home" className="flex shrink-0 items-center gap-2.5" href="/">
          <Image
            alt=""
            className="h-10 w-10 rounded-md object-cover"
            height={192}
            priority
            src="/icons/icon-192.png"
            width={192}
          />
          <span className="leading-none">
            <span className="block font-serif text-2xl font-semibold tracking-[0.16em] text-white">IFTA</span>
            <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.32em] text-white/65">Consulting</span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-0.5 xl:flex">
          {mainNav.map((item) => (
            <Link
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "relative rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                isActive(item.href)
                  ? "text-white after:absolute after:inset-x-2.5 after:-bottom-1 after:h-0.5 after:bg-brand-gold"
                  : "text-white/75 hover:text-white",
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}

          <details className="group relative">
            <summary className="flex list-none items-center gap-1 rounded-md px-2.5 py-2 text-[13px] font-medium text-white/75 transition-colors hover:text-white">
              Resources
              <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 top-11 w-64 rounded-lg border border-white/15 bg-[#0b2540] p-2 shadow-xl">
              {resourceNav.map((item) => (
                <Link className="block rounded-md px-3 py-3 transition-colors hover:bg-white/10" href={item.href} key={item.href}>
                  <span className="block text-sm font-semibold text-white">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-white/60">{item.description}</span>
                </Link>
              ))}
            </div>
          </details>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <ThemeToggle className="border-white/20 text-white hover:bg-white/10" />
          <Link
            aria-label="Open service cart"
            className="grid h-10 w-10 place-items-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            href="/cart"
            title="Service cart"
          >
            <ShoppingCart aria-hidden="true" className="h-5 w-5" />
          </Link>
          <Link className={consultationButtonClass} href="/contact">
            <CalendarDays aria-hidden="true" className="h-4 w-4" />
            Book a consultation
          </Link>
        </div>

        <button
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          className="grid h-10 w-10 place-items-center rounded-md border border-white/20 text-white transition-colors hover:bg-white/10 xl:hidden"
          onClick={() => setMobileOpen((current) => !current)}
          type="button"
        >
          {mobileOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/15 bg-[#071b30] px-4 py-4 sm:px-6 xl:hidden">
          <nav aria-label="Mobile navigation" className="mx-auto grid max-w-7xl gap-1">
            {[...mainNav, ...resourceNav].map((item) => (
              <Link
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item.href) ? "bg-white/10 text-brand-gold" : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
                href={item.href}
                key={item.href}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/15 pt-4">
              <ThemeToggle className="w-full justify-center border-white/20 text-white" />
              <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/20 text-sm font-medium text-white" href="/cart" onClick={() => setMobileOpen(false)}>
                <ShoppingCart aria-hidden="true" className="h-4 w-4" />
                Service cart
              </Link>
              <Link className={cn(consultationButtonClass, "col-span-2")} href="/contact" onClick={() => setMobileOpen(false)}>
                Book a consultation
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
