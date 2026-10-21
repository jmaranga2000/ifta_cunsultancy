import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, FileCheck2, LockKeyhole, MessageSquareText, ShieldCheck } from "lucide-react";

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

const steps = [
  { id: "choose", title: "Choose a service", text: "Pick what you need and add it to your cart." },
  { id: "send", title: "Send your request", text: "Create a free account. You pay nothing yet." },
  { id: "agree", title: "Agree the details", text: "We reply with a price. You approve and sign online." },
  { id: "track", title: "Follow the work", text: "Share files, chat and see progress in one place." },
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

export default async function PublicHomePage() {
  const services = (await listServices({ publishedOnly: true })).slice(0, 6);

  return (
    <main>
      <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden bg-brand-deep text-white sm:min-h-[72svh] lg:min-h-[42rem]">
        <Image
          alt="IFTA Consulting advisers at work"
          className="object-cover object-[70%_center]"
          fill
          priority
          quality={80}
          sizes="100vw"
          src="/images/ifta-consulting-team.png"
        />
        <div className="absolute inset-0 bg-brand-deep/85 lg:bg-gradient-to-r lg:from-brand-deep lg:via-brand-deep/90 lg:to-brand-deep/30" />
        <div className="relative mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-28 lg:px-8">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Tax and finance help, made simple.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/85">
            Choose a service, send your request online and follow the work from your phone or computer.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className={buttonClassName({ variant: "accent", size: "lg" })} href="/services">
              See our services
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              className={buttonClassName({ className: "border-white/50 bg-transparent text-white hover:bg-white/10", variant: "ghost", size: "lg" })}
              href="/client-portal"
            >
              Sign in to my account
            </Link>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="bg-background px-5 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-foreground">How it works</h2>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <li className="rounded-xl border border-border bg-card p-6" key={step.id}>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{index + 1}</span>
                  <h3 className="mt-4 text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-base leading-7 text-muted-foreground">{step.text}</p>
                </li>
              ))}
            </ol>
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
