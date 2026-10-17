import { CheckCircle2 } from "lucide-react";
import { ContactForm } from "@/components/public/contact-form";
import { PublicPageIntro } from "@/components/public/public-page-intro";

const nextSteps = [
  "We read your message.",
  "We reply with questions or a price.",
  "You decide if you want to go ahead.",
] as const;

export default async function ContactPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; sent?: string }>;
}) {
  const params = await searchParams;

  return (
    <main>
      <PublicPageIntro description="Tell us what you need. We usually reply within one working day." title="Talk to us" />

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-6 md:py-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-foreground">Send us a message</h2>
          {params?.sent ? (
            <div className="ifta-badge-success mt-5 flex items-center gap-2 rounded-lg border px-4 py-3 text-base font-semibold" role="status">
              <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
              Thank you. We have your message and will reply soon.
            </div>
          ) : null}
          {params?.error ? (
            <div className="ifta-badge-danger mt-5 rounded-lg border px-4 py-3 text-base font-semibold text-danger" role="alert">
              {params.error}
            </div>
          ) : null}
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>

        <aside>
          <h2 className="text-2xl font-bold text-foreground">What happens next</h2>
          <ol className="mt-5 grid gap-4">
            {nextSteps.map((step, index) => (
              <li className="flex items-center gap-4 text-lg text-foreground" key={step}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-8 rounded-xl bg-brand-soft p-5 text-base leading-7 text-brand-deep">
            Please do not send passwords or ID documents here. We will ask for them safely once you have an account.
          </p>
        </aside>
      </section>
    </main>
  );
}
