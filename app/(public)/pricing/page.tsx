import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PublicPageIntro } from "@/components/public/public-page-intro";
import { buttonClassName } from "@/components/ui/button";
import { listPricingPlans } from "@/repositories/service-catalog-repository";

export const dynamic = "force-dynamic";

const priceFactors = ["How much work is involved", "How soon you need it", "How complex your situation is"] as const;

const questions = [
  { q: "Is the price fixed?", a: "For clear, small jobs, yes. We tell you the price before any work starts." },
  { q: "When do I pay?", a: "After you accept our price. The payment dates are written in your engagement letter." },
  { q: "What if the work changes?", a: "We agree any change with you first, before the price or deadline moves." },
] as const;

export default async function PricingPage() {
  const plans = await listPricingPlans({ publishedOnly: true });

  return (
    <main>
      <PublicPageIntro description="You always see the price before work starts." title="Simple, honest pricing" />

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              className={plan.featured ? "rounded-xl border-2 border-primary bg-brand-deep p-7 text-white" : "rounded-xl border border-border bg-card p-7"}
              key={plan.id}
            >
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              <p className="mt-3 text-3xl font-bold">{plan.priceLabel}</p>
              <p className={plan.featured ? "mt-3 text-base leading-7 text-white/85" : "mt-3 text-base leading-7 text-muted-foreground"}>{plan.description}</p>
              <ul className="mt-5 grid gap-2">
                {plan.features.map((feature) => (
                  <li className="flex items-start gap-2 text-base font-medium" key={feature}>
                    <Check aria-hidden="true" className={plan.featured ? "mt-1 h-4 w-4 shrink-0 text-brand-mist" : "mt-1 h-4 w-4 shrink-0 text-primary"} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link className={buttonClassName({ className: "mt-7 w-full", variant: plan.featured ? "accent" : "primary" })} href="/contact">
                Get a quote
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-surface-subtle px-5 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-foreground">What decides the price?</h2>
            <ul className="mt-4 grid gap-3">
              {priceFactors.map((factor) => (
                <li className="flex items-start gap-2 text-lg text-foreground" key={factor}>
                  <Check aria-hidden="true" className="mt-1.5 h-4 w-4 shrink-0 text-primary" />
                  {factor}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4">
            {questions.map((item) => (
              <div key={item.q}>
                <h3 className="text-lg font-bold text-foreground">{item.q}</h3>
                <p className="mt-1 text-base leading-7 text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
