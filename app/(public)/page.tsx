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
  CircleCheck,
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
    cardClassName: "border-[#dce8f5] bg-[#edf5fc]",
    iconClassName: "bg-[#dceafa] text-[#16477c]",
    arrowClassName: "bg-[#16477c] text-white",
  },
  {
    id: "accounting-services",
    icon: BriefcaseBusiness,
    title: "Accounting Services",
    detail: "Accurate records. Better decisions.",
    cardClassName: "border-[#deebe2] bg-[#eff7f0]",
    iconClassName: "bg-[#deeee0] text-[#4b8967]",
    arrowClassName: "bg-[#4b8967] text-white",
  },
  {
    id: "financial-consulting",
    icon: TrendingUp,
    title: "Financial Consulting",
    detail: "Plan growth. Track performance.",
    cardClassName: "border-[#f0e5d5] bg-[#fbf4e9]",
    iconClassName: "bg-[#f8ead1] text-[#c18425]",
    arrowClassName: "bg-[#d59a3d] text-white",
  },
 
] as const;

const steps = [
  { id: "choose", icon: CalendarDays, title: "Select a Service", detail: "Choose the service that fits your needs." },
  { id: "request", icon: FileCheck2, title: "Submit Request", detail: "Fill in the form and upload your documents." },
  { id: "track", icon: MessageSquareText, title: "Track Progress", detail: "Stay updated through your client portal." },
  { id: "results", icon: CircleCheck, title: "Get Results", detail: "We handle the rest and deliver with care." },
] as const;

const reasons = [
  { id: "expertise", icon: BadgeCheck, title: "Professional Expertise", text: "Skilled professionals with industry experience." },
  { id: "transparency", icon: TrendingUp, title: "Transparency", text: "Clear communication. No hidden costs." },
  { id: "confidentiality", icon: LockKeyhole, title: "Confidentiality", text: "Your information is always secure." },
  { id: "support", icon: Headset, title: "Client Support", text: "Dedicated support when you need it." },
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

export default function PublicHomePage() {
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
        <section className="bg-[#fbfaf7] px-5 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div className="max-w-lg">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-deep/70">Our services</p>
                <h2 className="mt-2 text-4xl font-semibold leading-tight text-[#0c2340] sm:text-5xl">
                  Comprehensive financial solutions
                </h2>
                <p className="mt-3 text-base leading-6 text-[#3a4d62]">
                  We offer a full range of professional services tailored to your unique needs.
                </p>
                <Link
                  className={buttonClassName({ className: "mt-5 rounded-lg border-brand-gold/70 text-brand-deep hover:bg-brand-gold-soft", size: "sm", variant: "secondary" })}
                  href="/services"
                >
                  View all services <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {serviceHighlights.map(({ id, icon: Icon, title, detail, cardClassName, iconClassName, arrowClassName }) => (
                  <Link
                    className={`group flex min-h-48 flex-col rounded-2xl border p-4 shadow-[0_8px_24px_rgba(18,59,109,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-md ${cardClassName}`}
                    href="/services"
                    key={id}
                  >
                    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}>
                      <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={1.8} />
                    </div>
                    <h3 className="font-sans text-base font-semibold leading-snug text-[#112a46]">{title}</h3>
                    <p className="mt-2 font-sans text-xs leading-5 text-[#55657d]">{detail}</p>
                    <span className={`mt-auto ml-auto grid h-7 w-7 place-items-center rounded-full ${arrowClassName}`}>
                      <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="bg-white px-5 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div className="max-w-md">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-deep/70">How it works</p>
              <h2 className="mt-2 text-4xl font-semibold leading-tight text-[#0c2340] sm:text-5xl">
                Getting started is simple
              </h2>
              <p className="mt-3 text-base leading-6 text-[#3a4d62]">
                From your first consultation to the completion of your request, we make the process easy and transparent.
              </p>
              <Link className={buttonClassName({ className: "mt-5 rounded-lg", size: "sm", variant: "primary" })} href="/contact">
                Book a consultation <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
            <ol className="grid gap-x-4 gap-y-7 sm:grid-cols-2 xl:grid-cols-4">
              {steps.map(({ id, icon: Icon, title, detail }, index) => (
                <li className="relative flex flex-col items-start" key={id}>
                  <div className="relative mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#f0f4fa] text-brand-deep">
                    <Icon aria-hidden="true" className="h-7 w-7" strokeWidth={1.8} />
                    <span className="absolute -left-2 bottom-0 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-[#092b4d] text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="font-sans text-sm font-semibold text-[#112a46]">{title}</h3>
                  <p className="mt-1.5 font-sans text-xs leading-5 text-[#55657d]">{detail}</p>
                  {index < steps.length - 1 ? (
                    <ArrowRight aria-hidden="true" className="absolute right-1 top-5 hidden h-4 w-4 text-brand-deep/75 xl:block" />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="relative isolate overflow-hidden bg-[#06213b] text-white">
          <div className="mx-auto grid max-w-7xl lg:min-h-[24rem] lg:grid-cols-[0.9fr_1.3fr_0.8fr]">
            <div className="px-5 py-12 sm:px-8 lg:flex lg:flex-col lg:justify-center lg:px-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">Why choose IFTA</p>
              <h2 className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl">Your trust, our priority</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
                We go beyond numbers. Our commitment is to provide reliable, confidential and professional services that help you make informed financial decisions.
              </p>
              <Link className={buttonClassName({ className: "mt-5 w-fit rounded-lg", size: "sm", variant: "accent" })} href="/about">
                Learn more about us <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-6 px-5 pb-10 sm:px-8 lg:content-center lg:px-8 lg:py-10">
              {reasons.map(({ id, icon: Icon, title, text }) => {
                return (
                  <div className="border-b border-white/15 py-4 last:border-b-0" key={id}>
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand-gold/50 bg-white/5 text-brand-gold">
                        <Icon aria-hidden="true" className="h-5 w-5" />
                      </span>
                      <h3 className="font-sans text-sm font-semibold text-white">{title}</h3>
                    </div>
                    <p className="mt-2 pl-[3.25rem] text-xs leading-5 text-white/70">{text}</p>
                  </div>
                );
              })}
            </div>
            <div className="relative min-h-56 overflow-hidden lg:min-h-full">
              <Image
                alt="IFTA consultants advising a client"
                className="object-cover"
                fill
                sizes="(min-width: 1024px) 25vw, 100vw"
                src="/images/financial-consultation-cta.jpg"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#06213b]/35 to-transparent lg:from-[#06213b]/10" />
              <p className="absolute bottom-6 right-5 max-w-56 rotate-[-4deg] font-serif text-lg italic leading-snug text-white drop-shadow-lg">
                “Professional, reliable and always on my side.”
              </p>
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
