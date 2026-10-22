import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Calculator,
  CalendarDays,
  Check,
  FileCheck2,
  Headset,
  LockKeyhole,
  MessageSquareText,
  Scale,
  ShieldCheck,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import { buttonClassName } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { serviceImageSource } from "@/features/services/presentation";
import { listServices } from "@/repositories/service-catalog-repository";

export const metadata: Metadata = {
  title: "Tax, Accounting and Finance Help | IFTA Consulting",
  description: "Tax, accounting and finance help for businesses in Kenya. Pick a service, send a request and track the work online.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "IFTA Consulting | Tax and Finance Help",
    description: "Pick a service, send a request and track the work online.",
    type: "website",
    images: [{ url: "/images/ifta-consulting-team.png", width: 1200, height: 630, alt: "IFTA Consulting advisers at work" }],
  },
};

export const dynamic = "force-dynamic";

const serviceHighlights = [
  {
    id: "tax-advisory",
    icon: Calculator,
    title: "Tax Advisory",
    detail: "Minimise liabilities, maximise returns.",
  },
  {
    id: "accounting-services",
    icon: BriefcaseBusiness,
    title: "Accounting Services",
    detail: "Accurate records. Better decisions.",
  },
  {
    id: "financial-consulting",
    icon: TrendingUp,
    title: "Financial Consulting",
    detail: "Plan growth. Track performance.",
  },
 
] as const;

const reasons = [
  { id: "clear", icon: FileCheck2, title: "Clear price and scope", text: "You know what you get before work starts." },
  { id: "checked", icon: ShieldCheck, title: "Checked by experts", text: "Every piece of work is reviewed before you see it." },
  { id: "safe", icon: LockKeyhole, title: "Your files stay private", text: "Only you and your IFTA team can open them." },
  { id: "chat", icon: MessageSquareText, title: "Answers when you need them", text: "Message your team from the portal any time." },
] as const;

const faqs = [
  { id: "start", question: "When does the work start?", answer: "After we review your request, agree the price with you and you sign the engagement letter." },
  { id: "pay", question: "Do I pay when I send a request?", answer: "No. You only pay after you accept our price. You can pay by M-Pesa, bank or card." },
  { id: "documents", question: "What documents will I need?", answer: "Usually your ID, KRA PIN and records for the service. We tell you exactly what to send." },
  { id: "safe", question: "Are my documents safe?", answer: "Yes. Files are private to you and your IFTA team, and every login is protected." },
] as const;

const heroHighlights = [
  {
    id: "trusted",
    icon: ShieldCheck,
    title: "Trusted by individuals & businesses",
    detail: "Reliable. Professional. Committed.",
  },
  {
    id: "experienced",
    icon: UsersRound,
    title: "Experienced professionals",
    detail: "Deep expertise. Real solutions.",
  },
  {
    id: "compliance",
    icon: BadgeCheck,
    title: "Regulatory compliance",
    detail: "Guidance to help you stay up to date.",
  },
  {
    id: "support",
    icon: Headset,
    title: "Dedicated client support",
    detail: "Here when you need us.",
  },
] as const;

export default async function PublicHomePage() {
  const services = (await listServices({ publishedOnly: true })).slice(0, 6);

  return (
    <main>
      <section className="relative isolate flex min-h-[calc(100svh-4.5rem)] flex-col overflow-hidden bg-[#071b30] text-white">
        <Image
          alt="IFTA Consulting advisers at work"
          className="object-cover object-[68%_center]"
          fill
          priority
          quality={85}
          sizes="100vw"
          src="/images/ifta-consulting-team.png"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06182b]/95 via-[#09223c]/90 via-55% to-[#09223c]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06182b]/80 via-transparent to-[#06182b]/15" />
        <div aria-hidden="true" className="absolute inset-y-0 left-[58%] hidden w-px rotate-[29deg] bg-gradient-to-b from-transparent via-brand-gold/80 to-transparent lg:block" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-20 lg:px-10 lg:pb-14 lg:pt-20">
          <div className="max-w-3xl">
            <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-gold sm:text-xs sm:tracking-[0.16em]">
              <span aria-hidden="true" className="h-px w-5 bg-brand-gold" />
              <span>Tax</span><span aria-hidden="true">|</span>
              <span>Accounting</span><span aria-hidden="true">|</span>
              <span>Financial consulting</span><span aria-hidden="true">|</span>
            </p>
            <h1 className="mt-5 max-w-3xl font-serif text-[2.65rem] font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Smarter financial decisions for a{" "}
              <span className="text-brand-gold">stronger tomorrow.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
              IFTA Consulting provides expert tax advisory, accounting and financial consulting to help
              individuals and businesses stay compliant, strengthen their finances and achieve their goals.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className={buttonClassName({
                  className: "h-13 rounded-xl px-6 shadow-[0_8px_24px_rgba(242,191,104,0.2)]",
                  size: "lg",
                  variant: "accent",
                })}
                href="/contact"
              >
                <CalendarDays aria-hidden="true" className="h-5 w-5" />
                Book a consultation
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                className={buttonClassName({
                  className: "h-13 rounded-xl border-white/70 bg-[#0b223b]/35 px-6 text-white hover:border-white hover:bg-white/10",
                  variant: "ghost",
                  size: "lg",
                })}
                href="/services"
              >
                Explore our services
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        <div className="relative border-t border-white/20 bg-[#071b30]/80 backdrop-blur-sm">
          <div className="mx-auto grid max-w-7xl grid-cols-2 px-3 sm:px-8 lg:grid-cols-4 lg:px-10">
            {heroHighlights.map(({ id, icon: Icon, title, detail }, index) => (
              <div
                className={`flex min-h-32 items-center gap-3 px-3 py-5 sm:gap-4 sm:px-5 sm:py-6 lg:min-h-28 ${index % 2 === 1 ? "border-l border-white/20" : ""} ${index > 1 ? "border-t border-white/20 lg:border-t-0" : ""} ${index > 0 && index % 2 === 0 ? "lg:border-l" : ""}`}
                key={id}
              >
                <Icon aria-hidden="true" className="h-8 w-8 shrink-0 text-brand-gold sm:h-9 sm:w-9" strokeWidth={1.5} />
                <div>
                  <h2 className="text-sm font-semibold leading-snug text-white sm:text-base">{title}</h2>
                  <p className="mt-1.5 text-xs leading-5 text-white/65 sm:text-sm">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Reveal>
        <section className="bg-[#f7f7f5] px-5 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-deep/70">Our services</p>
                <h2 className="mt-2 max-w-xl text-4xl font-semibold leading-tight text-[#0c2340] sm:text-5xl">
                  Comprehensive financial solutions
                </h2>
              </div>
              <p className="max-w-xl text-base leading-7 text-[#3a4d62]">
                We offer a full range of professional services tailored to your unique needs.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {serviceHighlights.map(({ id, icon: Icon, title, detail }) => (
                <div
                  className="group rounded-[20px] border border-[#dfe7f4] bg-white p-5 shadow-[0_8px_24px_rgba(18,59,109,0.04)] transition-transform duration-200 hover:-translate-y-1"
                  key={id}
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#edf4ff] text-[#123b6d] shadow-inner">
                    <Icon aria-hidden="true" className="h-7 w-7" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-[1.05rem] font-semibold text-[#112a46]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#55657d]">{detail}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#123b6d]">
                    <span>Learn more</span>
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-[#dfe7f4] bg-[#f8fafc] text-base transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {services.length > 0 ? (
        <Reveal>
          <section className="bg-surface-subtle px-5 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-3xl font-bold text-foreground">What we can do for you</h2>
                <Link className="inline-flex items-center gap-2 font-bold text-primary hover:underline" href="/services">
                  See all services <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service, index) => (
                  <Link
                    className="group overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg"
                    href={`/services#${service.slug}`}
                    key={service.id}
                  >
                    <div className="relative aspect-[16/9] bg-muted">
                      <Image
                        alt={service.imageAlt}
                        className="object-cover"
                        fill
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        src={serviceImageSource(service, index)}
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-foreground">{service.title}</h3>
                      <p className="mt-2 text-base leading-7 text-muted-foreground">{service.summary}</p>
                      <span className="mt-4 inline-flex items-center gap-2 font-bold text-primary">
                        Learn more <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </Reveal>
      ) : null}

      <Reveal>
        <section className="bg-background px-5 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-foreground">Why clients choose IFTA</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {reasons.map((reason) => {
                const Icon = reason.icon;
                return (
                  <div className="rounded-xl border border-border bg-card p-6" key={reason.id}>
                    <Icon aria-hidden="true" className="h-7 w-7 text-accent" />
                    <h3 className="mt-4 text-lg font-bold text-foreground">{reason.title}</h3>
                    <p className="mt-2 text-base leading-7 text-muted-foreground">{reason.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="bg-surface-subtle px-5 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-foreground">Common questions</h2>
            <div className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
              {faqs.map((faq) => (
                <details className="group p-5" key={faq.id}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-foreground">
                    {faq.question}
                    <span aria-hidden="true" className="text-2xl text-primary transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-base leading-7 text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <section className="bg-brand-deep px-5 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="mt-2 flex items-center gap-2 text-lg text-white/85">
              <Check aria-hidden="true" className="h-5 w-5" /> Free to sign up. Pay only after you agree the price.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className={buttonClassName({ variant: "accent", size: "lg" })} href="/services">Choose a service</Link>
            <Link className={buttonClassName({ className: "border-white/50 bg-transparent text-white hover:bg-white/10", variant: "ghost", size: "lg" })} href="/contact">
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
