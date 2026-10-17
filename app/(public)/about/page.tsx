import Link from "next/link";
import { ArrowRight, FileCheck2, Handshake, ShieldCheck } from "lucide-react";
import { PublicPageIntro } from "@/components/public/public-page-intro";
import { buttonClassName } from "@/components/ui/button";

const values = [
  { id: "clear", icon: FileCheck2, title: "Clear from the start", text: "You know the work, the price and the deadline before we begin." },
  { id: "careful", icon: ShieldCheck, title: "Carefully checked", text: "A second expert reviews important work before it reaches you." },
  { id: "together", icon: Handshake, title: "Done with you", text: "Share files, ask questions and follow progress in one place." },
] as const;

export default function AboutPage() {
  return (
    <main>
      <PublicPageIntro
        description="IFTA Consulting (K) Ltd helps businesses in Kenya with tax, accounting and finance, and keeps the whole process online and easy to follow."
        title="About IFTA"
      />
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 md:py-16 lg:px-8">
        <h2 className="text-3xl font-bold text-foreground">How we work</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div className="rounded-xl border border-border bg-card p-6" key={value.id}>
                <Icon aria-hidden="true" className="h-8 w-8 text-accent" />
                <h3 className="mt-4 text-xl font-bold text-foreground">{value.title}</h3>
                <p className="mt-2 text-base leading-7 text-muted-foreground">{value.text}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link className={buttonClassName({ size: "lg" })} href="/services">
            See our services
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link className={buttonClassName({ size: "lg", variant: "secondary" })} href="/contact">Talk to us</Link>
        </div>
      </section>
    </main>
  );
}
